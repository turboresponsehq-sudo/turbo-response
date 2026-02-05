import { z } from "zod";
import { execSync } from "child_process";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  /**
   * Version endpoint for deployment tracking
   * Returns commit SHA, build time, and environment info
   * Used to verify which code version is deployed
   */
  version: publicProcedure.query(() => {
    try {
      // Get git commit SHA (short version)
      const commitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
      const commitShort = commitSha.substring(0, 7);
      
      // Get commit timestamp
      const commitDate = execSync('git log -1 --format=%ai', { encoding: 'utf-8' }).trim();
      
      // Get commit message
      const commitMessage = execSync('git log -1 --format=%s', { encoding: 'utf-8' }).trim();
      
      // Get branch name
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
      
      // Server uptime
      const uptimeSeconds = process.uptime();
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);
      
      const uptimeParts = [];
      if (hours > 0) uptimeParts.push(`${hours}h`);
      if (minutes > 0) uptimeParts.push(`${minutes}m`);
      if (seconds > 0 || uptimeParts.length === 0) uptimeParts.push(`${seconds}s`);
      const uptime = uptimeParts.join(' ');
      
      return {
        status: 'healthy',
        version: commitShort,
        commitSha: commitSha,
        commitDate: commitDate,
        commitMessage: commitMessage,
        branch: branch,
        buildTime: new Date().toISOString(),
        uptime: uptime,
        uptimeSeconds: Math.floor(uptimeSeconds),
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        features: {
          cookieAuth: false,  // Will be true after PR #4
          ragSystem: true,
          clientPortal: true,
          mobileIntakeFix: true  // Commit d8e1daa0
        }
      };
    } catch (error) {
      // If git commands fail (e.g., not in git repo), return minimal info
      return {
        status: 'healthy',
        version: 'unknown',
        error: 'Git information not available',
        uptime: `${Math.floor(process.uptime())}s`,
        environment: process.env.NODE_ENV || 'development'
      };
    }
  }),
});
