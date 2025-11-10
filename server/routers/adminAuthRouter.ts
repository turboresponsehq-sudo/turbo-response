import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminSessions, type InsertAdminSession } from "../../drizzle/schema";
import { getDb } from "../db";
import { publicProcedure, router } from "../_core/trpc";
import { randomUUID } from "crypto";

/**
 * Admin authentication router
 * Uses localStorage tokens with Authorization header (not HTTP-only cookies)
 * This approach works reliably in dev environments with complex domain structures
 */

// Hardcoded admin credentials (TODO: Move to environment variables or database)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const adminAuthRouter = router({
  /**
   * Login procedure
   * Validates username/password and returns a session token
   */
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { username, password } = input;

      // Validate credentials
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      // Generate session token
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

      // Save session to database
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const session: InsertAdminSession = {
        token,
        username,
        expiresAt,
      };

      await db.insert(adminSessions).values(session);

      console.log('[adminAuth.login] Session created:', token.substring(0, 8) + '...');

      return {
        success: true,
        token, // Frontend will store this in localStorage
        expiresAt: expiresAt.toISOString(),
      };
    }),

  /**
   * Validate session procedure
   * Checks if the token from Authorization header is valid
   */
  validateSession: publicProcedure
    .input(z.object({ token: z.string() }).optional())
    .query(async ({ input, ctx }) => {
      // Try to get token from input (sent by frontend) or Authorization header
      let token = input?.token;
      
      if (!token) {
        const authHeader = ctx.req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        console.log('[adminAuth.validateSession] No token provided');
        return { valid: false, username: null };
      }

      const db = await getDb();
      if (!db) {
        return { valid: false, username: null };
      }

      // Find session in database
      const sessions = await db
        .select()
        .from(adminSessions)
        .where(eq(adminSessions.token, token))
        .limit(1);

      if (sessions.length === 0) {
        console.log('[adminAuth.validateSession] Token not found in database');
        return { valid: false, username: null };
      }

      const session = sessions[0];

      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        console.log('[adminAuth.validateSession] Session expired');
        // Delete expired session
        await db.delete(adminSessions).where(eq(adminSessions.token, token));
        return { valid: false, username: null };
      }

      console.log('[adminAuth.validateSession] Session valid for user:', session.username);
      return {
        valid: true,
        username: session.username,
        expiresAt: session.expiresAt.toISOString(),
      };
    }),

  /**
   * Logout procedure
   * Deletes the session from database
   */
  logout: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const { token } = input;

      if (token) {
        const db = await getDb();
        if (db) {
          // Delete session from database
          await db.delete(adminSessions).where(eq(adminSessions.token, token));
          console.log('[adminAuth.logout] Session deleted:', token.substring(0, 8) + '...');
        }
      }

      return { success: true };
    }),
});
