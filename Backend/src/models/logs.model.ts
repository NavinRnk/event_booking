import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/database';

class logs extends Model {
    log_id: any
    level: any
    action: any
    message: any
    user_id: any
    details: any
    createdAt: any
}

logs.init(
    {
        log_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        level: {
            type: DataTypes.ENUM('info', 'warn', 'error'),
            allowNull: false,
            defaultValue: 'info',
        },
        action: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        details: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        tableName: 'logs',
        sequelize,
        indexes: [
            { fields: ['action'] },
            { fields: ['user_id'] },
        ],
    }
);

export default logs;
