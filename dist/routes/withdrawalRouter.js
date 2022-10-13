"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const withdrawalController_1 = require("../controller/withdrawalController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/withdraw', auth_1.auth, withdrawalController_1.withdraw);
router.get('/getAll', auth_1.auth, withdrawalController_1.getAllWithdrawals);
router.get('/getUserWithdrawal', auth_1.auth, withdrawalController_1.getUserWithdrawals);
exports.default = router;
