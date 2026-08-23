import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import path from 'path';
import setupRoutes from './src/routes/index_route';
import "./src/models/index_models";
import sequelize from './src/database/database';
import { ensureDatabaseReady } from './src/database/ensure-database';
import { seedDemoData } from './src/seed';
import { env } from './src/config/env';
import logRequest from './src/helpers/request-handler';
import { verifyToken } from './src/middlewares/verify-token';
import { sanitizeRequest } from './src/middlewares/sanitize';
import { generalLimiter } from './src/middlewares/rate-limiter';
import { notFound, errorHandler } from './src/middlewares/error-handler';

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(bodyParser.json({ limit: '100kb' }));
app.use(express.urlencoded({ limit: '100kb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(sanitizeRequest);

app.use('/api', generalLimiter);

app.use(logRequest);

app.use(verifyToken);

app.get("/", (req, res) => {
  res.send("Event & Ticket System Backend Server is running");
});

setupRoutes(app);

app.use(notFound);
app.use(errorHandler);

const PORT = env.port;

const start = async () => {
  try {
    await ensureDatabaseReady();

    await sequelize.authenticate();
    console.log(`[db] Connected to MySQL database "${env.mysql.database}".`);

    await seedDemoData();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Allowed CORS origins: ${env.corsOrigins.join(', ')}`);
    });
  } catch (error: any) {
    console.error('[fatal] Startup failed - database is not available:', error.message);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (reason) => {
  console.error('[fatal] Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught exception:', err);
});

export default app;
