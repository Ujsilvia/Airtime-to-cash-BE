import express from 'express';
import { getAllWithdrawals, getUserWithdrawals, withdraw } from '../controller/withdrawalController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/withdraw', auth, withdraw)
router.get('/getAll', auth, getAllWithdrawals)
router.get('/getUserWithdrawal', auth, getUserWithdrawals)

export default router;
