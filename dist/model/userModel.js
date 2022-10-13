"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInstance = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
const accountsModel_1 = require("./accountsModel");
const transactionsModel_1 = require("./transactionsModel");
const withdrawBalanceModel_1 = require("./withdrawBalanceModel");
class UserInstance extends sequelize_1.Model {
}
exports.UserInstance = UserInstance;
UserInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    firstname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'First Name cannot be empty',
            },
            notEmpty: {
                msg: 'Please provide a Name',
            },
        },
    },
    lastname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Last Name cannot be empty',
            },
            notEmpty: {
                msg: 'Please provide a Name',
            },
        },
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Username cannot be empty',
            },
            notEmpty: {
                msg: 'Please provide a Username',
            },
        },
        unique: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Email cannot be empty',
            },
            isEmail: {
                msg: 'Please provide a valid Email',
            },
        },
        unique: true,
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
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Password cannot be empty',
            },
            notEmpty: {
                msg: 'Please provide a password',
            },
        },
    },
    avatar: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOA8-aNtpaUiEp2YmB9QCAAtGGjvhRtGZ1Fb_-Mcc-XWPPNF0moeotjN_R-hYjv9PJDP4&usqp=CAU',
    },
    isVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    walletBalance: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user',
    },
}, {
    sequelize: database_config_1.default,
    tableName: 'Users',
});
UserInstance.hasMany(accountsModel_1.AccountInstance, { foreignKey: "userId", as: "account" });
UserInstance.hasMany(transactionsModel_1.TransactionsInstance, { foreignKey: "userId", as: "Transactions" });
UserInstance.hasMany(withdrawBalanceModel_1.WithdrawBalanceInstance, { foreignKey: "userId", as: "Withdrawals" });
accountsModel_1.AccountInstance.belongsTo(UserInstance, { foreignKey: "userId", as: "user" });
transactionsModel_1.TransactionsInstance.belongsTo(UserInstance, { foreignKey: "userId", as: "user" });
withdrawBalanceModel_1.WithdrawBalanceInstance.belongsTo(UserInstance, { foreignKey: "userId", as: "user" });
