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

// Handle pre-parsed bodies from Vercel Serverless environment
app.use((req, res, next) => {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // not JSON string, leave as-is
    }
  }
  if (req.body && typeof req.body === 'object') {
    req._body = true;
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const healthHandler = (req, res) => {
  res.json({ status: 'ok', message: 'Azure Cove API is running.' });
};

const supabaseStatusHandler = async (req, res) => {
  const status = await getSupabaseHealth();
  res.json(status);
};

// Health endpoints
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/api/supabase-status', supabaseStatusHandler);
app.get('/supabase-status', supabaseStatusHandler);

// API routes mounted with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contact', contactRoutes);

// Fallback: also mount directly at root for proxy/rewrite compatibility
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/admin', adminRoutes);
app.use('/chat', chatRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/reports', reportRoutes);
app.use('/contact', contactRoutes);

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
