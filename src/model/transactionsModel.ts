import { DataTypes, Model } from 'sequelize';
import db from '../config/database.config';

interface TransactionsAttribute {
  id: string;
  network: string;
  phoneNumber: string;
  amount: number;
  status: boolean;
  userId: string;
}

export class TransactionsInstance extends Model<TransactionsAttribute> {}

TransactionsInstance.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        network: {
            type: DataTypes.STRING,
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
            type: DataTypes.STRING,
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
            type: DataTypes.NUMBER,
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
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        userId: {
            type: DataTypes.STRING,
        }
    }, {
        sequelize: db,
        tableName: 'Transactions',
    }
)