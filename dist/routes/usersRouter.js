"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const router = express_1.default.Router();
/* GET users listing. */
router.get('/', function (req, res, next) {
    return res.status(200).json({ message: 'Welcome to Live POD-A Project', route: '/users' });
});
router.post('/sendmail', userController_1.sendEmail);
router.post('/users', userController_1.createUser);
router.post('/login', userController_1.loginUser);
router.post('/credit', userController_1.creditWallet);
router.post('/forgot-password', userController_1.forgotPassword);
router.patch('/users/:id', userController_1.updateUser);
router.post('/change-password/:id', userController_1.changePassword);
router.get('/verify/:token', userController_1.verifyUser);
exports.default = router;
