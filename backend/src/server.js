// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { initDatabase } = require('./services/database/init');

// Import routes
const authRoutes = require('./routes/auth');
const intakeRoutes = require('./routes/intake');
const blueprintRoutes = require('./routes/blueprint');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const casesRoutes = require('./routes/cases');
const uploadRoutes = require('./routes/upload');
const adminConsumerRoutes = require('./routes/adminConsumer');
const businessIntakeRoutes = require('./routes/businessIntake');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use( 
  cors({
    origin: "https://turboresponsehq.ai",
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
app.use('/api/blueprint', blueprintRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin/consumer', adminConsumerRoutes);
app.use('/api/business-intake', businessIntakeRoutes);

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
