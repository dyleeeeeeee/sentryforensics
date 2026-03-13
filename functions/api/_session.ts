import type { Env, User, Session } from "./_types";
import { extractToken } from "./_utils";
import { defaultUsers } from "./_defaults"; // still used for requireAuth fallback

export async function requireAuth(request: Request, env: Env): Promise<User | null> {
  const token = extractToken(request);
  if (!token) return null;

  const raw = await env.SENTRY_KV.get(`session:${token}`);
  if (!raw) return null;

  const session: Session = JSON.parse(raw);
  const usersRaw = await env.SENTRY_KV.get("users");
  const users: User[] = usersRaw ? JSON.parse(usersRaw) : defaultUsers();
  return users.find((u) => u.id === session.userId) ?? null;
}

export async function getUserAssets(user: User, env: Env) {
  const raw = await env.SENTRY_KV.get(`assets:${user.id}`);
  return raw ? JSON.parse(raw) : [];
}

export async function getUserTransactions(user: User, env: Env) {
  const raw = await env.SENTRY_KV.get(`transactions:${user.id}`);
  return raw ? JSON.parse(raw) : [];
}
