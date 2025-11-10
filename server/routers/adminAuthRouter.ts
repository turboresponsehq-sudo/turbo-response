import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminSessions, type InsertAdminSession } from "../../drizzle/schema";
import { getDb } from "../db";
import { publicProcedure, router } from "../_core/trpc";
import { randomUUID } from "crypto";

/**
 * Admin authentication router
 * Handles login, session validation, and logout without Manus OAuth
 */

// Hardcoded admin credentials (TODO: Move to environment variables or database)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const adminAuthRouter = router({
  /**
   * Login procedure
   * Validates username/password and creates a session token
   */
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
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

      // Set HTTP-only cookie
      ctx.res.cookie("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION_MS,
        path: "/",
      });

      return {
        success: true,
        token,
        expiresAt: expiresAt.toISOString(),
      };
    }),

  /**
   * Validate session procedure
   * Checks if the current session token is valid
   */
  validateSession: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.req.cookies?.admin_session;

    if (!token) {
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
      return { valid: false, username: null };
    }

    const session = sessions[0];

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      // Delete expired session
      await db.delete(adminSessions).where(eq(adminSessions.token, token));
      return { valid: false, username: null };
    }

    return {
      valid: true,
      username: session.username,
      expiresAt: session.expiresAt.toISOString(),
    };
  }),

  /**
   * Logout procedure
   * Deletes the session from database and clears the cookie
   */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const token = ctx.req.cookies?.admin_session;

    if (token) {
      const db = await getDb();
      if (db) {
        // Delete session from database
        await db.delete(adminSessions).where(eq(adminSessions.token, token));
      }
    }

    // Clear cookie
    ctx.res.clearCookie("admin_session", { path: "/" });

    return { success: true };
  }),
});
