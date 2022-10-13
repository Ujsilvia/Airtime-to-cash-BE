"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsInstance = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
class TransactionsInstance extends sequelize_1.Model {
}
exports.TransactionsInstance = TransactionsInstance;
TransactionsInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    network: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Network cannot be empty',
            },
            notEmpty: {
                msg: 'Please provide a Network',
            },
        },
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Phone Number cannot be empty',
            },
            notEmpty: {
                msg: 'Please provide a Phone Number',
            },
        },
    },
    amount: {
        type: sequelize_1.DataTypes.NUMBER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Amount cannot be empty',
            },
            notEmpty: {
                msg: 'Please provide Amount',
            },
        },
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
    }
}, {
    sequelize: database_config_1.default,
    tableName: 'Transactions',
});
