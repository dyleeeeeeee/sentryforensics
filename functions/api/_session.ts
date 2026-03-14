import type { Env, User, Session, Asset } from "./_types";
import { extractToken } from "./_utils";
import { getLiveRates } from "./_rates";

export async function requireAuth(request: Request, env: Env): Promise<User | null> {
  const token = extractToken(request);
  if (!token) return null;

  const raw = await env.SENTRY_KV.get(`session:${token}`);
  if (!raw) return null;

  const session: Session = JSON.parse(raw);

  // Check if admin terminated this user's sessions
  const invalidatedAt = await env.SENTRY_KV.get(`sessions_invalidated:${session.userId}`);
  if (invalidatedAt && session.createdAt < parseInt(invalidatedAt)) return null;

  const usersRaw = await env.SENTRY_KV.get("users");
  if (!usersRaw) return null;
  const users: User[] = JSON.parse(usersRaw);
  return users.find((u) => u.id === session.userId) ?? null;
}

export async function getUserAssets(user: User, env: Env): Promise<Asset[]> {
  const raw = await env.SENTRY_KV.get(`assets:${user.id}`);
  const assets: Asset[] = raw ? JSON.parse(raw) : [];
  if (assets.length === 0) return [];

  const symbols = assets.map((a) => a.symbol);
  const rates = await getLiveRates(env, symbols);

  return assets.map((a) => {
    const rate = rates[a.symbol] ?? a.usdRate;
    return {
      ...a,
      usdRate: rate,
      usd: parseFloat((a.amount * rate).toFixed(2)),
    };
  });
}

export async function getUserTransactions(user: User, env: Env) {
  const raw = await env.SENTRY_KV.get(`transactions:${user.id}`);
  return raw ? JSON.parse(raw) : [];
}
