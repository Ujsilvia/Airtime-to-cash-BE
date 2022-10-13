import { boolean } from "joi";
import { DataTypes, Model } from "sequelize";
import db from '../config/database.config';

interface WithdrawBalanceAttribute {
    id:string;
    status: boolean;
    amount: string;
    accountNumber: string;
    bankName: string;
    userId:string;
}
export class WithdrawBalanceInstance extends Model<WithdrawBalanceAttribute> {}

WithdrawBalanceInstance.init(
    {
        id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN
        },
        amount: {
            type: DataTypes.STRING,
            allowNull: false
        },
        accountNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        bankName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId:{
            type: DataTypes.UUIDV4,
        }
    },

    {
        sequelize: db,
        tableName: 'Withdrawals'
    }
);