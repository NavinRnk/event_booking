import sequelize from "../database/database";

import users from "./users.model";
import events from "./events.model";
import bookings from "./bookings.model";
import logs from "./logs.model";

const models: Record<string, any> = {};

models.users = users;

models.events = events;

models.bookings = bookings;

models.logs = logs;

Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

sequelize.sync({ force: false })
  .then(() => {
    console.log('connected to database.');
  })
  .catch((error: any) => {
    console.error('Error syncing tables: ', error);
  });

export { sequelize, users, events, bookings, logs };
export default models;
