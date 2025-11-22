import type { NextFunction, Request, Response } from "express";

export function accessTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  if (token !== process.env.ACCESS_TOKEN) {
    return res.status(403).json({ error: "Invalid access token" });
  }

  next();
}