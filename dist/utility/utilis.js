"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.withdrawalSchema = exports.transactionsSchema = exports.createAccountSchema = exports.changePasswordSchema = exports.registerUserSchema = exports.generateToken = exports.loginUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.loginUserSchema = joi_1.default.object().keys({
    email: joi_1.default.string().trim().lowercase(),
    username: joi_1.default.string().trim().lowercase(),
    password: joi_1.default.string().required(),
});
const generateToken = (user) => {
    const passPhrase = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign(user, passPhrase, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
exports.registerUserSchema = joi_1.default.object()
    .keys({
    firstname: joi_1.default.string().trim().required(),
    lastname: joi_1.default.string().trim().required(),
    username: joi_1.default.string().trim().required(),
    email: joi_1.default.string().trim().lowercase().required(),
    phoneNumber: joi_1.default.string()
        .length(11)
        .pattern(/^[0-9]+$/)
        .required(),
    password: joi_1.default.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
    avatar: joi_1.default.string(),
    isVerified: joi_1.default.boolean(),
    confirmPassword: joi_1.default.ref('password'),
})
    .with('password', 'confirmPassword');
exports.changePasswordSchema = joi_1.default.object().keys({
    password: joi_1.default.string().required(),
    confirmPassword: joi_1.default.any()
        .equal(joi_1.default.ref('password'))
        .required()
        .label('Confirm password')
        .messages({ 'any.only': '{{#label}} does not match' }),
})
    .with('password', 'confirmPassword');
exports.createAccountSchema = joi_1.default.object().keys({
    bankName: joi_1.default.string().trim().required(),
    accountNumber: joi_1.default.string().trim().required().pattern(/^[0-9]+$/).length(10),
    accountName: joi_1.default.string().trim().required(),
    walletBalance: joi_1.default.number().min(0),
    userId: joi_1.default.string().trim(),
});
exports.transactionsSchema = joi_1.default.object().keys({
    network: joi_1.default.string().required(),
    phoneNumber: joi_1.default.string().required(),
    amount: joi_1.default.string().required(),
    status: joi_1.default.boolean(),
    userId: joi_1.default.string(),
});
exports.withdrawalSchema = joi_1.default.object().keys({
    id: joi_1.default.string(),
    amount: joi_1.default.string().required(),
    status: joi_1.default.boolean(),
    accountNumber: joi_1.default.string().trim().required().pattern(/^[0-9]+$/).length(10),
    bankName: joi_1.default.string().trim().required(),
    userId: joi_1.default.string(),
    email: joi_1.default.string(),
    bankCode: joi_1.default.string(),
    password: joi_1.default.string().required()
});
exports.options = {
    abortEarly: false,
    errors: {
        wrap: {
            label: '',
        },
    },
};
