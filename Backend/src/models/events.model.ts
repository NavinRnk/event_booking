import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/database';
import bookings from './bookings.model';

class events extends Model {
    event_id: any
    title: any
    description: any
    event_date: any
    location: any
    total_tickets: any
    available_tickets: any
    metadata: any
    created_by: any
    organization_id: any
    last_actionby: any
    last_action: any
    is_deleted: any
    createdAt: any
    bookings: any
}

events.init(
    {
        event_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        event_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        total_tickets: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        available_tickets: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            validate: { min: 0 },
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {},
        },
        created_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        organization_id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
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
        tableName: 'events',
        sequelize,
        indexes: [
            { fields: ['event_date'] },
            { fields: ['created_by'] },
            { fields: ['is_deleted'] },
        ],
    }
);

events.hasMany(bookings, {
    foreignKey: "event_id",
    as: "bookings",
    onDelete: "RESTRICT",
});

export default events;
