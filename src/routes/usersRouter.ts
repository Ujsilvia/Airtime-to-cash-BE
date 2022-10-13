import express, { Request, Response, NextFunction } from 'express';
import { changePassword, createUser, creditWallet, forgotPassword, loginUser, sendEmail, updateUser, verifyUser } from '../controller/userController';

const router = express.Router();
/* GET users listing. */
router.get('/', function (req, res, next) {
  return res.status(200).json({ message: 'Welcome to Live POD-A Project', route: '/users' });
});

router.post('/sendmail', sendEmail)
router.post('/users', createUser);
router.post('/login', loginUser);
router.post('/credit', creditWallet);
router.post('/forgot-password', forgotPassword);
router.patch('/users/:id', updateUser);
router.post('/change-password/:id', changePassword);
router.get('/verify/:token', verifyUser);

export default router;
