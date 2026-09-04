import "server-only";
import bcrypt from "bcryptjs";

export { createSessionToken, verifySessionToken, SESSION_COOKIE } from "@/lib/jwt-edge";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
