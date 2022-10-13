"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditWallet = exports.changePassword = exports.forgotPassword = exports.updateUser = exports.createUser = exports.sendEmail = exports.verifyUser = exports.loginUser = void 0;
const uuid_1 = require("uuid");
const userModel_1 = require("../model/userModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SendMail_1 = __importDefault(require("../mailer/SendMail"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const TransactionTemplate_1 = require("../mailer/email_templates/TransactionTemplate");
const utilis_1 = require("../utility/utilis");
const VerificationTemplate_1 = require("../mailer/email_templates/VerificationTemplate");
const ForgotPasswordTemplates_1 = require("../mailer/email_templates/ForgotPasswordTemplates");
const fromUser = process.env.FROM;
const jwtSecret = process.env.JWT_SECRET;
async function loginUser(req, res) {
    try {
        const { username, email, password } = req.body;
        const validationResult = utilis_1.loginUserSchema.validate(req.body, utilis_1.options);
        if (validationResult.error) {
            return res.status(400).json({ Error: validationResult.error.details[0].message });
        }
        let User = null;
        let id = null;
        let validUser = null;
        let verifiedUser = null;
        let verifiedUsername = null;
        if (email) {
            verifiedUser = (await userModel_1.UserInstance.findOne({ where: { isVerified: true, email: email } }));
        }
        else if (username) {
            verifiedUsername = (await userModel_1.UserInstance.findOne({
                where: { isVerified: true, username: username },
            }));
        }
        if (verifiedUser) {
            id = verifiedUser.id;
            User = verifiedUser;
        }
        else if (verifiedUsername) {
            id = verifiedUsername.id;
            User = verifiedUsername;
        }
        else {
            return res.status(401).json({ message: 'Email not verified' });
        }
        const token = (0, utilis_1.generateToken)({ id });
        if (User && User.password) {
            validUser = await bcryptjs_1.default.compare(password, User.password);
        }
        if (!validUser) {
            return res.status(401).json({ message: 'Invalid login details' });
        }
        return res.status(200).json({ message: 'Login successful', token, User });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'failed to login user',
            route: '/login',
            err
        });
    }
}
exports.loginUser = loginUser;
async function verifyUser(req, res, next) {
    try {
        const token = req.params.token;
        const { id } = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (!id) {
            res.status(401).json({
                Error: 'Verification failed',
                token,
            });
        }
        else {
            const user = await userModel_1.UserInstance.findOne({ where: { id } });
            const updateVerify = await user?.update({
                isVerified: true,
            });
            res.status(200).json({
                message: 'Successfully verified new user',
                status: 1,
                id,
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'failed to verify user',
            route: '/verify',
            error: error,
        });
    }
}
exports.verifyUser = verifyUser;
async function sendEmail(req, res, next) {
    try {
        const username = req.body.username;
        const template = req.body.template;
        const transactionDetails = req.body.transactionDetails;
        if (username && template) {
            const User = (await userModel_1.UserInstance.findOne({
                where: { username: username },
            }));
            const { email, id } = User;
            let html = '';
            let fromUser = process.env.FROM;
            let subject = '';
            const token = jsonwebtoken_1.default.sign({ id }, jwtSecret, { expiresIn: '30mins' });
            if (template === 'transaction') {
                html = (0, TransactionTemplate_1.TransactionEmail)(transactionDetails);
                subject = 'Your transaction details';
            }
            else if (template === 'verification') {
                html = (0, VerificationTemplate_1.emailVerificationView)(token);
                subject = 'Please confirm your email';
            }
            else {
                res.status(400).json({
                    error: 'Invalid template type',
                });
            }
            await SendMail_1.default.sendEmail(fromUser, email, subject, html);
            res.status(201).json({
                message: 'Successfully sent email',
                status: 1,
                email: email,
            });
        }
        else {
            res.status(400).json({
                error: 'Username and template required',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'failed to send email',
            route: '/sendmail',
            error: error,
        });
    }
}
exports.sendEmail = sendEmail;
async function createUser(req, res, next) {
    const id = (0, uuid_1.v4)();
    try {
        const validationResult = utilis_1.registerUserSchema.validate(req.body, utilis_1.options);
        if (validationResult.error) {
            return res.status(400).json({
                error: validationResult.error.details[0].message,
            });
        }
        const duplicateEmail = await userModel_1.UserInstance.findOne({
            where: { email: req.body.email },
        });
        const duplicateUsername = await userModel_1.UserInstance.findOne({
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
        const duplicatePhone = await userModel_1.UserInstance.findOne({
            where: { phoneNumber: req.body.phoneNumber },
        });
        if (duplicatePhone) {
            return res.status(409).json({
                message: 'Phone number is used',
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(req.body.password, 8);
        const ConfirmPasswordHash = await bcryptjs_1.default.hash(req.body.confirmPassword, 8);
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
        const userDetails = await userModel_1.UserInstance.create(userData);
        // const id = userDetails?.id;
        const token = (0, utilis_1.generateToken)({ id });
        let html = '';
        html = (0, VerificationTemplate_1.emailVerificationView)(token);
        await SendMail_1.default.sendEmail(fromUser, req.body.email, 'Verify Email', html);
        res.status(201).json({
            status: 'Success',
            token,
            message: 'Successfully created a user',
            data: userDetails,
        });
    }
    catch (error) {
        // console.log(error);
        res.status(500).json({
            status: 'Failed',
            message: 'Unable to create a user',
            error
        });
    }
}
exports.createUser = createUser;
async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const userDetails = await userModel_1.UserInstance.findOne({ where: { id } });
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
        }
        else {
            res.json({
                status: 'failed',
                message: 'User not found',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            status: 'Failed',
            Message: 'Unable to update user',
            error,
        });
    }
}
exports.updateUser = updateUser;
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const user = (await userModel_1.UserInstance.findOne({
            where: {
                email: email,
            },
        }));
        if (!user) {
            return res.status(404).json({
                message: 'email not found',
            });
        }
        const { id } = user;
        const subject = 'Password Reset';
        const token = jsonwebtoken_1.default.sign({ id }, jwtSecret, { expiresIn: '30mins' });
        const html = (0, ForgotPasswordTemplates_1.forgotPasswordVerification)(id);
        await SendMail_1.default.sendEmail(fromUser, req.body.email, subject, html);
        res.status(200).json({
            message: 'Check email for the verification link',
        });
    }
    catch (error) {
        console.log(error);
    }
}
exports.forgotPassword = forgotPassword;
async function changePassword(req, res) {
    try {
        const { id } = req.params;
        const validationResult = utilis_1.changePasswordSchema.validate(req.body, utilis_1.options);
        if (validationResult.error) {
            return res.status(400).json({
                error: validationResult.error.details[0].message,
            });
        }
        const user = await userModel_1.UserInstance.findOne({
            where: {
                id: id,
            },
        });
        if (!user) {
            return res.status(403).json({
                message: 'user does not exist',
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(req.body.password, 8);
        await user?.update({
            password: passwordHash,
        });
        return res.status(201).json({
            message: 'Password Successfully Changed',
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
}
exports.changePassword = changePassword;
async function creditWallet(req, res) {
    try {
        const { amount, email } = req.body;
        const user = await userModel_1.UserInstance.findOne({
            where: {
                email: email
            },
        });
        if (!user) {
            return res.status(404).json({
                message: 'email not found',
            });
        }
        else {
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
    }
    catch (error) {
        res.status(500).json({
            status: 'Failed',
            Message: 'Unable to update wallet',
            error,
        });
    }
}
exports.creditWallet = creditWallet;
