import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import net from 'node:net';
import bookingRoutes from './routes/bookingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { getSupabaseHealth } from './config/supabase.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const findAvailablePort = (startPort) => new Promise((resolve, reject) => {
  const server = net.createServer();

  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      resolve(findAvailablePort(startPort + 1));
      return;
    }

    reject(error);
  });

  server.listen(startPort, () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});

export const app = express();
const preferredPort = Number(process.env.PORT || process.env.VITE_API_PORT || 5001);

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Azure Cove API is running.' });
});

app.get('/api/supabase-status', async (req, res) => {
  const status = await getSupabaseHealth();
  res.json(status);
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contact', contactRoutes);

app.use(errorHandler);

const shouldStartServer = process.env.NODE_ENV !== 'test' && !process.env.VERCEL;

if (shouldStartServer) {
  const startServer = async () => {
    const port = await findAvailablePort(preferredPort);
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  };

  startServer().catch((error) => {
    console.error('Unable to start API server.', error);
    process.exit(1);
  });
}
