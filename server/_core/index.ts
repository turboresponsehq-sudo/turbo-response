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
  
  // TEMPORARY: Password reset endpoint
  app.post("/api/reset-admin-password", async (req, res) => {
    try {
      const bcrypt = await import("bcrypt");
      const { query } = await import("../../backend/src/services/database/db");
      
      const email = 'turboresponsehq@gmail.com';
      const newPassword = 'Admin123!';
      
      console.log('🔧 Resetting admin password...');
      
      const hashedPassword = await bcrypt.default.hash(newPassword, 10);
      
      const checkResult = await query(
        'SELECT id, email, role FROM users WHERE email = $1',
        [email]
      );
      
      if (checkResult.rows.length === 0) {
        await query(
          'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)',
          [email, hashedPassword, 'admin', 'Admin']
        );
        console.log('✅ Admin user created');
      } else {
        await query(
          'UPDATE users SET password = $1, role = $2 WHERE email = $3',
          [hashedPassword, 'admin', email]
        );
        console.log('✅ Password updated');
      }
      
      res.json({
        success: true,
        message: 'Admin password reset successfully',
        credentials: {
          email: 'turboresponsehq@gmail.com',
          password: 'Admin123!'
        }
      });
      
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
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
