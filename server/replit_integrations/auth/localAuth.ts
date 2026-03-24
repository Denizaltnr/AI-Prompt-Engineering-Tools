import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { authStorage } from "./storage";
import { sql } from "drizzle-orm";
import { db } from "../../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [hashedPassword, salt] = hash.split(".");
  if (!hashedPassword || !salt) return false;
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashedBuf = Buffer.from(hashedPassword, "hex");
  return timingSafeEqual(buf, hashedBuf);
}

export async function registerLocalUser(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
) {
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(password);
  const id = randomBytes(16).toString("hex");

  const [user] = await db
    .insert(users)
    .values({
      id,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      passwordHash,
      authProvider: "local",
    })
    .returning();

  return user;
}

export async function loginLocalUser(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !user.passwordHash) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return user;
}
