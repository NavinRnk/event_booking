import { Sequelize } from 'sequelize';
import { env } from '../config/env';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: env.mysql.host,
  port: env.mysql.port,
  username: env.mysql.user,
  password: env.mysql.password,
  database: env.mysql.database,
  logging: false,
});

export default sequelize;
