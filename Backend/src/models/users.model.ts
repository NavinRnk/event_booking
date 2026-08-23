import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../database/database';
import events from './events.model';
import bookings from './bookings.model';

class users extends Model {
    user_id: any
    user_name: any
    user_email_id: any
    password: any
    role: any
    organization_id: any
    is_createdby: any
    last_actionby: any
    last_action: any
    is_deleted: any
    createdAt: any
    events: any
    bookings: any

    async checkPassword(plain_password: string) {
        return bcrypt.compare(plain_password, this.password);
    }

    toSafeJSON() {
        return {
            user_id: this.user_id,
            user_name: this.user_name,
            user_email_id: this.user_email_id,
            role: this.role,
            createdAt: this.createdAt,
        };
    }
}

users.init(
    {
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        user_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        user_email_id: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user',
        },
        organization_id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        is_createdby: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
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
        tableName: 'users',
        sequelize,
        defaultScope: {
            attributes: { exclude: ['password'] },
        },
        scopes: {
            withPassword: { attributes: { include: ['password'] } },
        },
        hooks: {
            beforeSave: async (user: any) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
        },
    }
);

users.hasMany(events, {
    foreignKey: "created_by",
    as: "events",
    onDelete: "RESTRICT",
});
users.hasMany(bookings, {
    foreignKey: "user_id",
    as: "bookings",
    onDelete: "CASCADE",
});

export default users;
