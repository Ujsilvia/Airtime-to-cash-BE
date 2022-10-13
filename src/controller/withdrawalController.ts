import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { WithdrawBalanceInstance } from '../model/withdrawBalanceModel';
import { UserInstance } from '../model/userModel';
import { options, withdrawalSchema } from '../utility/utilis';
import bcrypt from 'bcryptjs'

const Flutterwave = require('flutterwave-node-v3')
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY)

export async function withdraw(req: Request | any, res: Response): Promise<unknown> {
    try {
        let id = uuidv4()
        const userId = req.user?.id as string

        const validateRecord = withdrawalSchema.validate(req.body, options)

        if (validateRecord.error) {
            return res.status(400).json({
                error: validateRecord.error.details[0].message
            })
        }

        const { email, amount, accountNumber, bankName, password, bankCode } = req.body
        const user = (await UserInstance.findOne({
            where: { email: email }
        })) as unknown as { [key: string]: any }
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const userPassword = user.password as string
        const validateUser = await bcrypt.compare(password, userPassword)

        if (!validateUser) {
            await WithdrawBalanceInstance.create({
                id,
                userId,
                amount,
                accountNumber,
                bankName,
                status: false,
            })
            return res.status(403).json({
                message: 'Password does not match'
            })
        }

        const userWalletBalance = user.walletBalance

        if (userWalletBalance < amount) {
            await WithdrawBalanceInstance.create({
                id,
                userId,
                amount,
                accountNumber,
                bankName,
                status: false
            })
            return res.status(400).json({
                message: 'Insufficient Fund'
            })
        }

        const details = {
            account_bank: bankCode,
            account_number: accountNumber,
            amount: amount,
            narration: 'Airtime to Cash POD A Payment',
            currency: 'NGN',
            callback_url: 'https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d',
            debit_currency: 'NGN'
        }

        flw.Transfer.initiate(details).then(console.log).catch(console.log)

        const newUserWalletBallance = Number((+userWalletBalance - amount).toFixed(2))

        await user.update({
            walletBalance: newUserWalletBallance
        })

        await WithdrawBalanceInstance.create({
            id,
            userId,
            amount,
            accountNumber,
            bankName,
            status: true
        })
        
        return res.status(200).json({
            message: 'Withdrawal Successful',
            newUserWalletBallance,
            user
        })
    } catch (error) {
        return res.status(500).json({
            message: 'failed to withdraw',
            route: '/withdrawals'
        })
    }
}


export async function getAllWithdrawals(req: Request, res: Response): Promise<unknown> {
  try {
    const { state } = req.query;
    if (state === 'true') {
      const withdrawals = await WithdrawBalanceInstance.findAndCountAll({
        where: {
          status: true,
        },
        include: [
          {
            model: UserInstance,
            attributes: ['id', 'walletBalance', 'email', 'username', 'phoneNumber'],
            as: 'user',
          },
        ],
      });
      return res.status(200).json({
        message: 'You have retrieved all successful withdrawals',
        withdrawals,
      });
    }
    if (state === 'false') {
      const withdrawals = await WithdrawBalanceInstance.findAndCountAll({
        where: {
          status: false,
        },
        include: [
          {
            model: UserInstance,
            attributes: ['id', 'walletBalance', 'email', 'username', 'phoneNumber'],
            as: 'user',
          },
        ],
      });
      return res.status(200).json({
        message: 'You have retrieved failed all withdrawals',
        withdrawals,
      });
    }
    const withdrawals = await WithdrawBalanceInstance.findAndCountAll({
      include: [
        {
          model: UserInstance,
          attributes: ['id', 'walletBalance', 'email', 'username', 'phoneNumber'],
          as: 'user',
        },
      ],
    });
    return res.status(200).json({
      message: 'You have successfully retrieved all withdrawals',
      withdrawals,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get withdrawals',
      route: '/getWithdrawals',
    });
  }
}


export async function getUserWithdrawals(req: Request | any, res: Response): Promise<unknown> {
  try {
    const { state } = req.query;
    const userId = req.user?.id as string;
    if (state === 'true') {
      const withdrawals = await WithdrawBalanceInstance.findAndCountAll({
        where: { userId, status: true },
        include: [
          {
            model: UserInstance,
            attributes: ['id', 'walletBalance', 'email', 'username', 'phoneNumber'],
            as: 'user',
          },
        ],
      });
      return res.status(200).json({
        withdrawals,
      });
    }
    if (state === 'false') {
      const withdrawals = await WithdrawBalanceInstance.findAndCountAll({
        where: { userId, status: false },
        include: [
          {
            model: UserInstance,
            attributes: ['id', 'walletBalance', 'email', 'username', 'phoneNumber'],
            as: 'user',
          },
        ],
      });
      return res.status(200).json({
        withdrawals,
      });
    }
    const withdrawals = await WithdrawBalanceInstance.findAndCountAll({
      where: { userId: userId },
      include: [
        {
          model: UserInstance,
          attributes: ['id', 'walletBalance', 'email', 'username', 'phoneNumber'],
          as: 'user',
        },
      ],
    });
    return res.status(200).json({
      message: 'You have successfully retrieved all withdrawals',
      withdrawals,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get withdrawals',
      route: '/getUserWithdrawals',
    });
  }
}

