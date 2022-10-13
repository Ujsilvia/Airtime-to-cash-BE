"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransaction = exports.createTransaction = void 0;
const uuid_1 = require("uuid");
const transactionsModel_1 = require("../model/transactionsModel");
const userModel_1 = require("../model/userModel");
const utilis_1 = require("../utility/utilis");
const SendMail_1 = __importDefault(require("../mailer/SendMail"));
const TransactionTemplate_1 = require("../mailer/email_templates/TransactionTemplate");
const fromUser = process.env.FROM;
async function createTransaction(req, res, next) {
    const id = (0, uuid_1.v4)();
    const userID = req.user.id;
    const convertedRate = Number((req.body.amount * 0.7).toFixed(2));
    try {
        const validateTransaction = utilis_1.transactionsSchema.validate(req.body, utilis_1.options);
        if (validateTransaction.error) {
            return res.status(400).json({ Error: validateTransaction.error.details[0].message });
        }
        const transaction = await transactionsModel_1.TransactionsInstance.create({
            id: id,
            network: req.body.network,
            phoneNumber: req.body.phoneNumber,
            amount: convertedRate,
            status: req.body.status,
            userId: userID,
        });
        let html = '';
        html = (0, TransactionTemplate_1.TransactionEmail)(`Transfer of ${req.body.amount} from ${req.body.network} network was sent by ${req.body.phoneNumber}. Kindly confirm and verify.<br>Thank you`);
        await SendMail_1.default.sendEmail(fromUser, 'oderinloanuoluwapo@gmail.com', 'Verify Transfer Airtime', html);
        return res.status(201).json({ message: 'Transaction Created Successfully', transaction });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'internal server error',
            route: '/transactions',
            error,
        });
    }
}
exports.createTransaction = createTransaction;
async function getTransaction(req, res, next) {
    let transaction = null;
    try {
        const limit = 15;
        const queryParameter = req.query.status;
        if (queryParameter === 'Pending-Transactions') {
            transaction = await transactionsModel_1.TransactionsInstance.findAll({
                where: { status: false },
                limit,
                order: [
                    ['createdAt', 'ASC']
                ],
                include: [{ model: userModel_1.UserInstance, as: 'user', attributes: ['id', 'firstname', 'lastname', 'email'] }],
            });
        }
        else if (queryParameter === 'All-Transactions') {
            transaction = await transactionsModel_1.TransactionsInstance.findAll({
                limit,
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [{ model: userModel_1.UserInstance, as: 'user', attributes: ['id', 'firstname', 'lastname', 'email'] }],
            });
        }
        else {
            return res.status(400).json({
                message: 'Error!. Please pass a valid query',
            });
        }
        return res.status(200).json({
            message: `You have successfully fetched ${queryParameter} transactions`,
            transaction,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'internal server error',
            route: '/transactions',
            error,
        });
    }
}
exports.getTransaction = getTransaction;
