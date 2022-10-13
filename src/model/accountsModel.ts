import { DataTypes, Model } from "sequelize";
import db from '../config/database.config';
import { UserInstance } from "./userModel";
interface AccountAttribute {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    userId: string;
    walletBalance: number;
}
export class AccountInstance extends Model<AccountAttribute> {
  User?: UserInstance[];

}
AccountInstance.init(
    {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accountNumber: {
        unique: true,
        type: DataTypes.STRING,
        allowNull: false
    },
    accountName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
    userId: {
        type: DataTypes.UUIDV4,
    },

    walletBalance: {
        type: DataTypes.NUMBER,
        defaultValue: 0
    },
    },

    {
        sequelize: db,
        tableName: 'accountTable'
    }
);