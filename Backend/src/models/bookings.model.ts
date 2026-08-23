import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/database';

class bookings extends Model {
    booking_id: any
    user_id: any
    event_id: any
    event_title: any
    quantity: any
    status: any
    last_actionby: any
    last_action: any
    is_deleted: any
    createdAt: any
}

bookings.init(
    {
        booking_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        event_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        event_title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 1,
        },
        status: {
            type: DataTypes.ENUM('confirmed', 'cancelled'),
            allowNull: false,
            defaultValue: 'confirmed',
        },
        last_actionby: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        last_action: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: 'bookings',
        sequelize,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['event_id'] },
        ],
    }
);

export default bookings;
