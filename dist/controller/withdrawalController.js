"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserWithdrawals = exports.getAllWithdrawals = exports.withdraw = void 0;
const uuid_1 = require("uuid");
const withdrawBalanceModel_1 = require("../model/withdrawBalanceModel");
const userModel_1 = require("../model/userModel");
const utilis_1 = require("../utility/utilis");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
async function withdraw(req, res) {
    try {
        let id = (0, uuid_1.v4)();
        const userId = req.user?.id;
        const validateRecord = utilis_1.withdrawalSchema.validate(req.body, utilis_1.options);
        if (validateRecord.error) {
            return res.status(400).json({
                error: validateRecord.error.details[0].message
            });
        }
        const { email, amount, accountNumber, bankName, password, bankCode } = req.body;
        const user = (await userModel_1.UserInstance.findOne({
            where: { email: email }
        }));
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        const userPassword = user.password;
        const validateUser = await bcryptjs_1.default.compare(password, userPassword);
        if (!validateUser) {
            await withdrawBalanceModel_1.WithdrawBalanceInstance.create({
                id,
                userId,
                amount,
                accountNumber,
                bankName,
                status: false,
            });
            return res.status(403).json({
                message: 'Password does not match'
            });
        }
        const userWalletBalance = user.walletBalance;
        if (userWalletBalance < amount) {
            await withdrawBalanceModel_1.WithdrawBalanceInstance.create({
                id,
                userId,
                amount,
                accountNumber,
                bankName,
                status: false
            });
            return res.status(400).json({
                message: 'Insufficient Fund'
            });
        }
        const details = {
            account_bank: bankCode,
            account_number: accountNumber,
            amount: amount,
            narration: 'Airtime to Cash POD A Payment',
            currency: 'NGN',
            callback_url: 'https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d',
            debit_currency: 'NGN'
        };
        flw.Transfer.initiate(details).then(console.log).catch(console.log);
        const newUserWalletBallance = Number((+userWalletBalance - amount).toFixed(2));
        await user.update({
            walletBalance: newUserWalletBallance
        });
        await withdrawBalanceModel_1.WithdrawBalanceInstance.create({
            id,
            userId,
            amount,
            accountNumber,
            bankName,
            status: true
        });
        return res.status(200).json({
            message: 'Withdrawal Successful',
            newUserWalletBallance,
            user
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'failed to withdraw',
            route: '/withdrawals'
        });
    }
}
exports.withdraw = withdraw;
async function getAllWithdrawals(req, res) {
    try {
        const { state } = req.query;
        if (state === 'true') {
            const withdrawals = await withdrawBalanceModel_1.WithdrawBalanceInstance.findAndCountAll({
                where: {
                    status: true,
                },
                include: [
                    {
                        model: userModel_1.UserInstance,
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
            const withdrawals = await withdrawBalanceModel_1.WithdrawBalanceInstance.findAndCountAll({
                where: {
                    status: false,
                },
                include: [
                    {
                        model: userModel_1.UserInstance,
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
        const withdrawals = await withdrawBalanceModel_1.WithdrawBalanceInstance.findAndCountAll({
            include: [
                {
                    model: userModel_1.UserInstance,
                    attributes: ['id', 'walletBalance', 'email', 'username', 'phoneNumber'],
                    as: 'user',
                },
            ],
        });
        return res.status(200).json({
            message: 'You have successfully retrieved all withdrawals',
            withdrawals,
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get withdrawals',
            route: '/getWithdrawals',
        });
    }
}
exports.getAllWithdrawals = getAllWithdrawals;
async function getUserWithdrawals(req, res) {
    try {
        const { state } = req.query;
        const userId = req.user?.id;
        if (state === 'true') {
            const withdrawals = await withdrawBalanceModel_1.WithdrawBalanceInstance.findAndCountAll({
                where: { userId, status: true },
                include: [
                    {
                        model: userModel_1.UserInstance,
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
            const withdrawals = await withdrawBalanceModel_1.WithdrawBalanceInstance.findAndCountAll({
                where: { userId, status: false },
                include: [
                    {
                        model: userModel_1.UserInstance,
                        attributes: ['id', 'walletBalance', 'email', 'username', 'phoneNumber'],
                        as: 'user',
                    },
                ],
            });
            return res.status(200).json({
                withdrawals,
            });
        }
        const withdrawals = await withdrawBalanceModel_1.WithdrawBalanceInstance.findAndCountAll({
            where: { userId: userId },
            include: [
                {
                    model: userModel_1.UserInstance,
                    attributes: ['id', 'walletBalance', 'email', 'username', 'phoneNumber'],
                    as: 'user',
                },
            ],
        });
        return res.status(200).json({
            message: 'You have successfully retrieved all withdrawals',
            withdrawals,
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get withdrawals',
            route: '/getUserWithdrawals',
        });
    }
}
exports.getUserWithdrawals = getUserWithdrawals;
