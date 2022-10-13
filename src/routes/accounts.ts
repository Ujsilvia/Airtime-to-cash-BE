import express from 'express';
const router = express.Router();
import {auth} from '../middleware/auth';
import{createAccount, deleteBankAccount, getBankAccounts, getUserAccount} from '../controller/account';

router.post('/create', auth, createAccount);
router.get('/getaccount', auth, getBankAccounts);
router.get('/getuseraccount/:id', auth, getUserAccount);
router.delete('/deleteaccount/:id', auth, deleteBankAccount);

export default router;
