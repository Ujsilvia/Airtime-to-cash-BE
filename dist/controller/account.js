"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAccount = exports.deleteBankAccount = exports.getBankAccounts = exports.createAccount = void 0;
const uuid_1 = require("uuid");
const utilis_1 = require("../utility/utilis");
const userModel_1 = require("../model/userModel");
const accountsModel_1 = require("../model/accountsModel");
// import { TransactionInstance } from '../model/transactions';
async function createAccount(req, res, next) {
    const id = (0, uuid_1.v4)();
    try {
        // const account = await AccountInstance.findOne({ where: { userId: req.user.id}})
        //   if (account) {
        //     return res.status(404).json({
        //       message: "Account already exist"
        //     });
        //   }
        const userID = req.user.id;
        const ValidateAccount = await utilis_1.createAccountSchema.validate(req.body, utilis_1.options);
        if (ValidateAccount.error) {
            return res.status(400).json({
                status: 'error',
                message: ValidateAccount.error.details[0].message,
            });
        }
        const duplicateAccount = await accountsModel_1.AccountInstance.findOne({
            where: { accountNumber: req.body.accountNumber },
        });
        if (duplicateAccount) {
            return res.status(409).json({
                message: "Account number is used, please enter another account number",
            });
        }
        const record = await accountsModel_1.AccountInstance.create({
            id: id,
            bankName: req.body.bankName,
            accountNumber: req.body.accountNumber,
            accountName: req.body.accountName,
            userId: userID,
            walletBalance: req.body.walletBalance,
        });
        if (record) {
            return res.status(201).json({
                status: 'success',
                message: 'Account created successfully',
                data: record,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'internal server error',
            error
        });
    }
}
exports.createAccount = createAccount;
async function getBankAccounts(req, res, next) {
    try {
        const userID = req.user.id;
        const account = await accountsModel_1.AccountInstance.findAll({
            where: { userId: userID }, include: [
                {
                    model: userModel_1.UserInstance,
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            message: 'internal server error',
        });
    }
}
exports.getBankAccounts = getBankAccounts;
async function deleteBankAccount(req, res, next) {
    try {
        const id = req.params.id;
        const account = await accountsModel_1.AccountInstance.findOne({
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
    }
    catch (error) {
        return res.status(500).json({
            message: 'internal server error',
        });
    }
}
exports.deleteBankAccount = deleteBankAccount;
async function getUserAccount(req, res, next) {
    try {
        const userID = req.user.id;
        const account = await accountsModel_1.AccountInstance.findAll({
            where: { userId: userID },
        });
        if (account) {
            return res.status(200).json({
                status: 'success',
                message: 'Account retrieved successfully',
                data: account,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'internal server error',
        });
    }
}
exports.getUserAccount = getUserAccount;
