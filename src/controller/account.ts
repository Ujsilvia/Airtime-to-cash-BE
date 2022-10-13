import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4, validate } from 'uuid';
import { createAccountSchema, options } from '../utility/utilis';
import { UserInstance } from '../model/userModel';
import { AccountInstance } from '../model/accountsModel';
// import { TransactionInstance } from '../model/transactions';

export async function createAccount(
    req: Request|any,
    res: Response,
    next: NextFunction
    ) {
        const id = uuidv4();
        try {

            // const account = await AccountInstance.findOne({ where: { userId: req.user.id}})

            //   if (account) {
            //     return res.status(404).json({
            //       message: "Account already exist"
            //     });
            //   }

         const userID = req.user.id;
        
         const ValidateAccount = await createAccountSchema.validate(req.body, options);
         if (ValidateAccount.error) {
                return res.status(400).json({
                    status: 'error',
                    message: ValidateAccount.error.details[0].message,
                });
         }
         const duplicateAccount = await AccountInstance.findOne({
                where: { accountNumber: req.body.accountNumber },
         })
         if ( duplicateAccount) {
            return res.status(409).json({
                message: "Account number is used, please enter another account number",
                });
        }
        const record = await AccountInstance.create({
            id: id,
            bankName: req.body.bankName,
            accountNumber: req.body.accountNumber,
            accountName: req.body.accountName,
            userId: userID,
            walletBalance: req.body.walletBalance,
        })
        if (record) {
            return res.status(201).json({
                status: 'success',
                message: 'Account created successfully',
                data: record,
            });
        }
    }catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'internal server error',
            error
        });
    }
}
export async function getBankAccounts(req: Request|any, res: Response, next: NextFunction) {
    try {
        const userID = req.user.id;
        const account = await AccountInstance.findAll({
            where: { userId: userID }, include: [
                {
                  model: UserInstance,
                  as: "user",
                  attributes: ["id", "firstname", "lastname", "email"]
                }
              ]
        });

        return res.status(200).json({
            status: 'success',
            message: 'Account retrieved successfully',
            data: account,
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: 'error',
            message: 'internal server error',
        });
    }
}
export async function deleteBankAccount(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id;
        const account = await AccountInstance.findOne({
            where: { id: id },
        });

        if (!account) {
            return res.status(403).json({
                message: 'Account not found',
            });
        }

        await account.destroy();
        return res.status(200).json({
            message: 'Account deleted successfully',
        });

    } catch (error) {
        return res.status(500).json({
            message: 'internal server error',
        });
    }
}
export async function getUserAccount(req: Request|any, res: Response, next: NextFunction) {
    try {
        const userID = req.user.id;
        const account = await AccountInstance.findAll({
            where: { userId: userID },
        });
        if (account) {
            return res.status(200).json({
                status: 'success',
                message: 'Account retrieved successfully',
                data: account,
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'internal server error',
        });
    }
}
