/**
 * Dev Auth Bypass — LOCAL DEVELOPMENT ONLY
 *
 * Provides a /api/dev-login endpoint that issues a valid session cookie
 * without going through Manus OAuth. Only active when DEV_USER_ID is set
 * in the environment AND NODE_ENV is "development".
 *
 * NEVER ship this to production — the guard below enforces that.
 */
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as db from "../db";
import { ENV } from "./env";

const isDevAuthEnabled =
  process.env.NODE_ENV === "development" &&
  typeof process.env.DEV_USER_ID === "string" &&
  process.env.DEV_USER_ID.length > 0;

export function registerDevAuthRoutes(app: Express) {
  if (!isDevAuthEnabled) {
    // Register a helpful 404-style handler so the developer knows what to do
    app.get("/api/dev-login", (_req: Request, res: Response) => {
      res.status(403).json({
        error: "Dev auth bypass is not enabled.",
        fix: "Add DEV_USER_ID=<your-openId> to your .env file and restart the server.",
        docs: "See .env.local.download for the full setup.",
      });
    });
    return;
  }

  const devOpenId = process.env.DEV_USER_ID as string;
  const devName = process.env.DEV_USER_NAME || "Dev User";
  const devEmail = process.env.DEV_USER_EMAIL || "dev@localhost";

  console.log(
    `[DevAuth] ⚠️  Dev auth bypass ENABLED for openId: ${devOpenId}`
  );

  /**
   * GET /api/dev-login
   * Issues a session cookie for the dev user and redirects to the app root.
   * Visit http://localhost:3000/api/dev-login in the browser to log in.
   */
  app.get("/api/dev-login", async (req: Request, res: Response) => {
    try {
      // Ensure the dev user exists in the database
      await db.upsertUser({
        openId: devOpenId,
        name: devName,
        email: devEmail,
        loginMethod: "dev",
        lastSignedIn: new Date(),
        // Grant admin role if the openId matches the owner
        role: devOpenId === ENV.ownerOpenId ? "admin" : "user",
      });

      // Sign a JWT session token (same mechanism as real OAuth flow)
      const sessionToken = await sdk.createSessionToken(devOpenId, {
        name: devName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);

      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
        // Allow non-secure on localhost
        secure: cookieOptions.secure ?? false,
      });

      console.log(`[DevAuth] Session issued for ${devName} (${devOpenId})`);

      // Redirect to the app
      const redirectTo = (req.query.redirect as string) || "/";
      res.redirect(redirectTo);
    } catch (error) {
      console.error("[DevAuth] Failed to create dev session:", error);
      res.status(500).json({ error: "Failed to create dev session", details: String(error) });
    }
  });

  /**
   * GET /api/dev-logout
   * Clears the session cookie.
   */
  app.get("/api/dev-logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    console.log("[DevAuth] Session cleared");
    res.redirect("/");
  });
}
