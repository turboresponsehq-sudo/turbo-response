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
console.log('[ROUTES] authRoutes loaded:', !!authRoutes, typeof authRoutes);
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
const resetAdminRoutes = require('./routes/resetAdmin'); // TEMPORARY - DELETE AFTER USE
// Brain routes disabled - not yet implemented

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - PERMISSIVE CORS (temporary fix for production)
app.use(
  cors({
    origin: true,        // Reflect request Origin; allows any origin
    credentials: true    // Allow cookies / auth headers
  })
);
app.options("*", cors()); // Enable pre-flight for all routes
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
// Test route to verify routing works
app.get('/api/test', (req, res) => {
  res.json({ message: 'API routing works!', timestamp: new Date().toISOString() });
});
console.log('[ROUTES] Registering /api/auth with authRoutes:', !!authRoutes);
app.use('/api/auth', authRoutes);
console.log('[ROUTES] /api/auth registered successfully');
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
app.use('/api', resetAdminRoutes); // TEMPORARY - DELETE AFTER USE (mounted on /api to bypass auth)
// app.use('/api/brain', brainRoutes); // Disabled - not yet implemented

// Serve frontend static files (must be after API routes, before 404 handler)
const frontendPath = path.join(__dirname, '../dist/public');

// Serve index.html for all non-API routes (client-side routing)
app.use((req, res, next) => {
  // Skip API routes and file requests
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Serve static files
app.use(express.static(frontendPath));

// 404 handler for API routes
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
    console.log('[STARTUP] Starting server...');
    console.log('[STARTUP] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('[STARTUP] PORT:', PORT);
    
    // Initialize database schema
    console.log('[STARTUP] Initializing database...');
    await initDatabase();
    console.log('[STARTUP] Database initialized successfully');
    
    // Run pending migrations
    try {
      console.log('[STARTUP] Running migrations...');
      const runMigrations = (await import('./migrations/run-migrations.mjs')).default;
      await runMigrations();
      console.log('[STARTUP] Migrations completed');
    } catch (migrationError) {
      console.log('[STARTUP] Migration error (non-fatal):', migrationError.message);
      logger.warn('Migration runner not available or failed:', migrationError.message);
    }
    
    // Seed admin account (auto-creates if not exists)
    console.log('[STARTUP] Seeding admin account...');
    await seedAdminAccount();
    console.log('[STARTUP] Admin account seeded');
    
    // Start server
    console.log('[STARTUP] Starting Express server on port', PORT);
    app.listen(PORT, () => {
      logger.info(`🚀 Turbo Response API running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`✅ DEPLOYMENT VERSION: ADMIN-RESET-FIX-1 (CORS permissive, force-upsert admin password)`);
    });
  } catch (error) {
    console.error('[STARTUP] FATAL ERROR:', error);
    console.error('[STARTUP] Error stack:', error.stack);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
