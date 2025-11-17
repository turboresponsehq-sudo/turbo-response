// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { initDatabase } = require('./services/database/init');
const { seedAdminAccount } = require('./services/database/seed');

// Import routes (updated: 2025-11-14 07:45 UTC)
const authRoutes = require('./routes/auth');
const intakeRoutes = require('./routes/intake');
// LEGACY_ROUTES_DISABLED – not used by React app (2025-11-13)
// const blueprintRoutes = require('./routes/blueprint');
// const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const casesRoutes = require('./routes/cases');
const uploadRoutes = require('./routes/upload');
const adminConsumerRoutes = require('./routes/adminConsumer');
const turboIntakeRoutes = require('./routes/turboIntake');
const turboRoutes = require('./routes/turbo');
const brainRoutes = require('./routes/brain');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use( 
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Check if origin matches allowed patterns
      const allowedOrigins = [
        "https://turboresponsehq.ai",
        /\.manusvm\.computer$/  // Allow all Manus dev server domains
      ];
      
      const isAllowed = allowedOrigins.some(pattern => {
        if (typeof pattern === 'string') {
          return origin === pattern;
        }
        return pattern.test(origin);
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically from Render persistent disk or local
const path = require('path');
const uploadsPath = process.env.RENDER_DISK_PATH 
  ? path.join(process.env.RENDER_DISK_PATH, 'uploads')
  : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Turbo Response API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/intake', intakeRoutes);
app.use('/api/turbo-intake', turboIntakeRoutes);
// LEGACY_ROUTES_DISABLED – not used by React app (2025-11-13)
// app.use('/api/blueprint', blueprintRoutes);
// app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', casesRoutes);  // Mount at /api for admin case routes
app.use('/api/upload', uploadRoutes);
app.use('/api/admin/consumer', adminConsumerRoutes);
app.use('/api/turbo', turboRoutes);
app.use('/api/brain', brainRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database schema
    await initDatabase();
    
    // Run pending migrations
    try {
      const runMigrations = (await import('./migrations/run-migrations.mjs')).default;
      await runMigrations();
    } catch (migrationError) {
      logger.warn('Migration runner not available or failed:', migrationError.message);
    }
    
    // Seed admin account (auto-creates if not exists)
    await seedAdminAccount();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Turbo Response API running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
