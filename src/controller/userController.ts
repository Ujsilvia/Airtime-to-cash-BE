import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UserInstance } from '../model/userModel';
import bcrypt from 'bcryptjs';
import mailer from '../mailer/SendMail';
import jwt from 'jsonwebtoken';

import { TransactionEmail } from '../mailer/email_templates/TransactionTemplate';
import { options, generateToken, loginUserSchema, registerUserSchema, changePasswordSchema } from '../utility/utilis';
import { emailVerificationView } from '../mailer/email_templates/VerificationTemplate';
import { forgotPasswordVerification } from '../mailer/email_templates/ForgotPasswordTemplates';
import { AccountInstance } from '../model/accountsModel';

const fromUser = process.env.FROM as string;
const jwtSecret = process.env.JWT_SECRET as string;

interface jwtPayload {
  id: string;
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;
    const validationResult = loginUserSchema.validate(req.body, options);

    if (validationResult.error) {
      return res.status(400).json({ Error: validationResult.error.details[0].message });
    }

    let User = null;
    let id = null;
    let validUser = null;
    let verifiedUser = null;
    let verifiedUsername = null;

    if (email) {
      verifiedUser = (await UserInstance.findOne({ where: { isVerified: true, email: email } })) as unknown as {
        [key: string]: string;
      };
    } else if (username) {
      verifiedUsername = (await UserInstance.findOne({
        where: { isVerified: true, username: username },
      })) as unknown as { [key: string]: string };
    }

    if (verifiedUser) {
      id = verifiedUser.id;
      User = verifiedUser;
    } else if (verifiedUsername) {
      id = verifiedUsername.id;
      User = verifiedUsername;
    } else {
      return res.status(401).json({ message: 'Email not verified' });
    }

    const token = generateToken({ id });

    if (User && User.password) {
      validUser = await bcrypt.compare(password, User.password);
    }

    if (!validUser) {
      return res.status(401).json({ message: 'Invalid login details' });
    }

    return res.status(200).json({ message: 'Login successful', token, User });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'failed to login user',
      route: '/login',
      err
    });
  }
}

export async function verifyUser(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.params.token;
    const { id } = jwt.verify(token, jwtSecret) as jwtPayload;

    if (!id) {
      res.status(401).json({
        Error: 'Verification failed',
        token,
      });
    } else {
      const user = await UserInstance.findOne({ where: { id } });
      const updateVerify = await user?.update({
        isVerified: true,
      });
      res.status(200).json({
        message: 'Successfully verified new user',
        status: 1,
        id,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'failed to verify user',
      route: '/verify',
      error: error,
    });
  }
}

export async function sendEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const username = req.body.username;
    const template = req.body.template;
    const transactionDetails = req.body.transactionDetails;

    if (username && template) {
      const User = (await UserInstance.findOne({
        where: { username: username },
      })) as unknown as { [key: string]: string };

      const { email, id } = User;

      let html = '';
      let fromUser = process.env.FROM as string;
      let subject = '';
      const token = jwt.sign({ id }, jwtSecret, { expiresIn: '30mins' });

      if (template === 'transaction') {
        html = TransactionEmail(transactionDetails);
        subject = 'Your transaction details';
      } else if (template === 'verification') {
        html = emailVerificationView(token);
        subject = 'Please confirm your email';
      } else {
        res.status(400).json({
          error: 'Invalid template type',
        });
      }

      await mailer.sendEmail(fromUser, email, subject, html);

      res.status(201).json({
        message: 'Successfully sent email',
        status: 1,
        email: email,
      });
    } else {
      res.status(400).json({
        error: 'Username and template required',
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'failed to send email',
      route: '/sendmail',
      error: error,
    });
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  const id = uuidv4();

  try {
    const validationResult = registerUserSchema.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.details[0].message,
      });
    }
    const duplicateEmail = await UserInstance.findOne({
      where: { email: req.body.email },
    });

    const duplicateUsername = await UserInstance.findOne({
      where: { username: req.body.username },
    });

    if (duplicateEmail) {
      return res.status(409).json({
        message: 'Email is used, please change email',
      });
    }

    if (duplicateUsername) {
      return res.status(409).json({
        message: 'Username is used, please change username',
      });
    }

    const duplicatePhone = await UserInstance.findOne({
      where: { phoneNumber: req.body.phoneNumber },
    });

    if (duplicatePhone) {
      return res.status(409).json({
        message: 'Phone number is used',
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 8);
    const ConfirmPasswordHash = await bcrypt.hash(req.body.confirmPassword, 8);
    const userData = {
      id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: passwordHash,
      confirmPassword: ConfirmPasswordHash,
      avatar: req.body.avatar,
      isVerified: req.body.isVerified,
      walletBalance: req.body.walletBalance
    };

    const userDetails = await UserInstance.create(userData);

    // const id = userDetails?.id;
    const token = generateToken({ id }) as string;
    let html = '';
    html = emailVerificationView(token);
    await mailer.sendEmail(fromUser, req.body.email, 'Verify Email', html);
    res.status(201).json({
      status: 'Success',
      token,
      message: 'Successfully created a user',
      data: userDetails,
    });
  } catch (error) {
    // console.log(error);

    res.status(500).json({
      status: 'Failed',
      message: 'Unable to create a user',
      error
    });
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userDetails = await UserInstance.findOne({ where: { id } });
    const { firstname, lastname, avatar, username, phoneNumber } = req.body;
    if (userDetails) {
      const userUpdate = await userDetails.update({
        firstname: firstname || userDetails.getDataValue('firstname'),
        lastname: lastname || userDetails.getDataValue('lastname'),
        avatar: avatar || userDetails.getDataValue('avatar'),
        phoneNumber: phoneNumber || userDetails.getDataValue('phoneNumber'),
        username: username || userDetails.getDataValue('username'),
      });
      res.status(201).json({
        status: 'Success',
        message: 'Successfully updated a user',
        data: userUpdate,
      });
    } else {
      res.json({
        status: 'failed',
        message: 'User not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      Message: 'Unable to update user',
      error,
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = (await UserInstance.findOne({
      where: {
        email: email,
      },
    })) as unknown as { [key: string]: string };
    if (!user) {
      return res.status(404).json({
        message: 'email not found',
      });
    }
    const { id } = user;
    const subject = 'Password Reset';
    const token = jwt.sign({ id }, jwtSecret, { expiresIn: '30mins' });
    const html = forgotPasswordVerification(id);
    await mailer.sendEmail(fromUser, req.body.email, subject, html);
    res.status(200).json({
      message: 'Check email for the verification link',
    });
  } catch (error) {
    console.log(error);
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validationResult = changePasswordSchema.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.details[0].message,
      });
    }
    const user = await UserInstance.findOne({
      where: {
        id: id,
      },
    });
    if (!user) {
      return res.status(403).json({
        message: 'user does not exist',
      });
    }
    const passwordHash = await bcrypt.hash(req.body.password, 8);
    await user?.update({
      password: passwordHash,
    });
    return res.status(201).json({
      message: 'Password Successfully Changed',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
}


export async function creditWallet(req: Request, res: Response) {
  try {
    const { amount, email } = req.body;
    const user = await UserInstance.findOne({
      where: {
        email: email
      },
    })

    if (!user) {
      return res.status(404).json({
        message: 'email not found',
      });
    } else {

      const { wallet } = user;
      const newAmount = amount + wallet;
      await user?.update({
        walletBalance: newAmount
      });

      res.status(200).json({
        message: 'Successfully updated wallet',
        status: 1,
        wallet: newAmount
      });
    }

  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      Message: 'Unable to update wallet',
      error,
    });
  }
}