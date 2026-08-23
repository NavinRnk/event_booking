import { Application, Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import bookingRoutes from './booking.routes';

const setupRoutes = (app: Application) => {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ success: true, message: 'API is running', time: new Date().toISOString() });
  });

  router.use('/auth', authRoutes);
  router.use('/events', eventRoutes);
  router.use('/bookings', bookingRoutes);

  app.use('/api', router);
};

export default setupRoutes;
