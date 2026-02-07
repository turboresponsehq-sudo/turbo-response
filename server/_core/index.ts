import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { brainRouter } from "./brainRouter";
import intakeRouter from "../routes/intake";
import { getDb } from "../db"; // Already imported above

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();

  // -------------------------
  // CORS CONFIGURATION
  // -------------------------
  app.use(
    cors({
      origin: [
        "https://turboresponsehq.ai",
        "https://turbo-response-backend.onrender.com",
        "http://localhost:3000"
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true
    })
  );

  app.options("*", cors());
  // -------------------------
  // END CORS CONFIGURATION
  // -------------------------

  const server = createServer(app);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Brain System routes (with access token middleware built-in)
  app.use("/api/brain", brainRouter);
  
  // Intake form routes (Offense and Defense)
  app.use("/api", intakeRouter);
  
  // Setup admin user (one-time)
  app.get("/api/setup-admin", async (req, res) => {
    try {
      const bcrypt = await import("bcrypt");
      const db = await getDb();
      
      if (!db) {
        return res.status(500).send('Database not available');
      }

      const email = 'turboresponsehq@gmail.com';
      const password = 'Admin123!';
      const hashedPassword = await bcrypt.default.hash(password, 10);

      // Add password column if needed
      try {
        await db.execute('ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER email');
        console.log('✅ Password column added');
      } catch (error: any) {
        console.log('✅ Password column exists');
      }

      // Check if admin exists
      const result: any = await db.execute(`SELECT id FROM users WHERE email = '${email}'`);
      const exists = result.rows?.length > 0 || result.length > 0;

      if (exists) {
        await db.execute(`UPDATE users SET password = '${hashedPassword}', role = 'admin' WHERE email = '${email}'`);
      } else {
        await db.execute(`
          INSERT INTO users (openId, email, password, role, name, createdAt, updatedAt, lastSignedIn) 
          VALUES ('admin-local', '${email}', '${hashedPassword}', 'admin', 'Admin', NOW(), NOW(), NOW())
        `);
      }

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Admin Setup Complete</title>
          <style>
            body { font-family: Arial; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); color: white; }
            .container { text-align: center; padding: 40px; background: rgba(15, 23, 42, 0.8); border-radius: 20px; border: 1px solid #06b6d4; }
            h1 { color: #06b6d4; }
            .credentials { background: rgba(30, 41, 59, 0.6); padding: 20px; border-radius: 10px; margin: 20px 0; }
            .value { color: #06b6d4; font-weight: bold; font-size: 18px; }
            a { display: inline-block; margin-top: 20px; padding: 15px 30px; background: #06b6d4; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Admin Setup Complete!</h1>
            <div class="credentials">
              <p>Email: <span class="value">turboresponsehq@gmail.com</span></p>
              <p>Password: <span class="value">Admin123!</span></p>
            </div>
            <a href="/admin/login">Go to Admin Login →</a>
          </div>
        </body>
        </html>
      `);
    } catch (error: any) {
      console.error('❌ Setup error:', error);
      res.status(500).send(`Error: ${error.message}`);
    }
  });

  // JWT verification middleware
  const verifyAdminToken = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('[Auth] Missing or invalid auth header');
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authHeader.substring(7);
      const jwt = await import('jsonwebtoken');
      const secret = process.env.JWT_SECRET;
      
      if (!secret) {
        console.error('[Auth] JWT_SECRET not set in environment');
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      console.log('[Auth] Verifying token with secret length:', secret.length);
      
      try {
        const decoded: any = jwt.default.verify(token, secret);
        console.log('[Auth] Token verified successfully for user:', decoded.email);
        
        if (decoded.role !== 'admin') {
          console.warn('[Auth] User is not admin:', decoded.email, 'role:', decoded.role);
          return res.status(403).json({ error: 'Admin access required', reason: 'User role is not admin', userRole: decoded.role });
        }
        
        req.user = decoded;
        next();
      } catch (err: any) {
        console.error('[Auth] Token verification failed:', err.message, 'Error name:', err.name);
        if (err.name === 'TokenExpiredError') {
          console.error('[Auth] Token is expired - user needs to re-login');
          return res.status(401).json({ error: 'Token expired', reason: 'Please login again' });
        }
        if (err.name === 'JsonWebTokenError') {
          console.error('[Auth] Invalid token signature or format');
          return res.status(401).json({ error: 'Invalid token', reason: 'Token signature invalid' });
        }
        console.error('[Auth] Unknown JWT error:', err);
        return res.status(401).json({ error: 'Invalid token', details: err.message });
      }
    } catch (error: any) {
      console.error('[Auth] Middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Admin login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }

      const bcrypt = await import("bcrypt");
      const jwt = await import("jsonwebtoken");
      const db = await getDb();
      
      if (!db) {
        return res.status(500).json({ message: 'Database not available' });
      }

      // Find user
      const result: any = await db.execute(`SELECT * FROM users WHERE email = '${email}' LIMIT 1`);
      const user = result.rows?.[0] || result[0];

      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await bcrypt.default.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check admin role
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Generate token
      const secret = process.env.JWT_SECRET;
      
      if (!secret) {
        console.error('[Login] JWT_SECRET not set in environment');
        return res.status(500).json({ message: 'Server configuration error' });
      }
      
      console.log('[Login] Generating token with secret length:', secret.length);
      const token = jwt.default.sign(
        { userId: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: '365d' }
      );
      console.log('[Login] Token generated successfully for:', user.email);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Admin cases endpoints
  app.get("/api/admin/cases", verifyAdminToken, async (req: any, res: any) => {
    try {
      const { listCases } = await import("../db");
      const cases = await listCases();
      res.json({ success: true, cases });
    } catch (error: any) {
      console.error('Error fetching cases:', error);
      res.status(500).json({ error: 'Failed to fetch cases' });
    }
  });
  
  // Frontend calls THIS endpoint - MUST match exactly
  app.get("/api/cases/admin/all", verifyAdminToken, async (req: any, res: any) => {
    try {
      console.log('[Cases API] Fetching all cases for admin');
      const { listCases } = await import("../db");
      const cases = await listCases();
      console.log('[Cases API] Found', cases.length, 'cases');
      res.json({ success: true, cases: cases || [] });
    } catch (error: any) {
      console.error('[Cases API] Error fetching cases:', error);
      res.status(500).json({ error: 'Failed to fetch cases', details: error.message });
    }
  });
  
  app.post("/api/admin/cases/create", verifyAdminToken, async (req: any, res: any) => {
    try {
      const { createCase } = await import("../db");
      const { title, category, description, client_name, client_email, client_phone } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      const caseData = {
        title,
        category: category || null,
        description: description || null,
        clientName: client_name || null,
        clientEmail: client_email || null,
        clientPhone: client_phone || null,
        status: 'open'
      };
      
      await createCase(caseData);
      res.json({ success: true, message: 'Case created successfully' });
    } catch (error: any) {
      console.error('Error creating case:', error);
      res.status(500).json({ error: 'Failed to create case' });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
