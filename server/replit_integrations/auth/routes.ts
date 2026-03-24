import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { registerLocalUser, loginLocalUser } from "./localAuth";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function registerAuthRoutes(app: Express): void {
  // Get current user (works for both OIDC and local auth)
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      let userId: string;

      if ((req.session as any).userId) {
        userId = (req.session as any).userId;
      } else {
        userId = req.user.claims.sub;
      }

      const user = await authStorage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Don't expose password hash
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Local registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { email, password, firstName, lastName } = parsed.data;
      const user = await registerLocalUser(email, password, firstName, lastName);

      (req.session as any).userId = user.id;
      req.session.save(() => {
        const { passwordHash, ...safeUser } = user;
        res.json(safeUser);
      });
    } catch (error: any) {
      if (error.message === "EMAIL_TAKEN") {
        return res.status(409).json({ message: "EMAIL_TAKEN" });
      }
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Local login
  app.post("/api/auth/local-login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { email, password } = parsed.data;
      const user = await loginLocalUser(email, password);

      (req.session as any).userId = user.id;
      req.session.save(() => {
        const { passwordHash, ...safeUser } = user;
        res.json(safeUser);
      });
    } catch (error: any) {
      if (error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ message: "INVALID_CREDENTIALS" });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Local logout
  app.post("/api/auth/local-logout", (req, res) => {
    (req.session as any).userId = undefined;
    req.session.save(() => res.json({ success: true }));
  });
}
