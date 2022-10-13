import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TransactionsInstance } from '../model/transactionsModel';
import { UserInstance } from '../model/userModel';
import { transactionsSchema, options } from '../utility/utilis';
import mailer from '../mailer/SendMail';
import { TransactionEmail } from '../mailer/email_templates/TransactionTemplate';

const fromUser = process.env.FROM as string;

export async function createTransaction(req: Request | any, res: Response, next: NextFunction) {
  const id = uuidv4();
  const userID = req.user.id as string;
  const convertedRate = Number((req.body.amount * 0.7).toFixed(2));

  try {
    const validateTransaction = transactionsSchema.validate(req.body, options);

    if (validateTransaction.error) {
      return res.status(400).json({ Error: validateTransaction.error.details[0].message });
    }

    const transaction = await TransactionsInstance.create({
      id: id,
      network: req.body.network,
      phoneNumber: req.body.phoneNumber,
      amount: convertedRate,
      status: req.body.status,
      userId: userID,
    });

    let html = '';
    html = TransactionEmail(
      `Transfer of ${req.body.amount} from ${req.body.network} network was sent by ${req.body.phoneNumber}. Kindly confirm and verify.<br>Thank you`,
    );
    await mailer.sendEmail(fromUser, 'oderinloanuoluwapo@gmail.com', 'Verify Transfer Airtime', html);

    return res.status(201).json({ message: 'Transaction Created Successfully', transaction });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'internal server error',
      route: '/transactions',
      error,
    });
  }
}

export async function getTransaction(req: Request, res: Response, next: NextFunction) {
  let transaction = null;
  try {
    const limit = 15 as number | undefined;
    const queryParameter = req.query.status;

    if (queryParameter === 'Pending-Transactions') {
      transaction = await TransactionsInstance.findAll({
        where: { status: false },
        limit,
        order: [
          ['createdAt', 'ASC']
        ],
        include: [{ model: UserInstance, as: 'user', attributes: ['id', 'firstname', 'lastname', 'email'] }],
      });
    } else if (queryParameter === 'All-Transactions') {
      transaction = await TransactionsInstance.findAll({
        limit,
        order: [
          ['createdAt', 'DESC']
        ],
        include: [{ model: UserInstance, as: 'user', attributes: ['id', 'firstname', 'lastname', 'email'] }],
      });
    } else {
      return res.status(400).json({
        message: 'Error!. Please pass a valid query',
      });
    }

    return res.status(200).json({
      message: `You have successfully fetched ${queryParameter} transactions`,
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'internal server error',
      route: '/transactions',
      error,
    });
  }
}