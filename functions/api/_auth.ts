import type { Env, User, PendingSession, Session } from "./_types";
import { json, cors, extractToken, generateOTP } from "./_utils";
import { defaultUsers } from "./_defaults";
import { requireAuth } from "./_session";

export async function handleAuth(
  request: Request,
  env: Env,
  segments: string[]
): Promise<Response> {
  const sub = segments[1];

  if (sub === "login" && request.method === "POST") {
    const body = (await request.json()) as { identifier: string; password: string };
    const { identifier, password } = body ?? {};
    if (!identifier || !password)
      return cors(json({ error: "Missing credentials" }, 400));

    const usersRaw = await env.SENTRY_KV.get("users");
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : defaultUsers();

    const user = users.find(
      (u) =>
        (u.caseId.toLowerCase() === identifier.toLowerCase() ||
          u.email.toLowerCase() === identifier.toLowerCase()) &&
        u.password === password
    );
    if (!user) return cors(json({ error: "Invalid credentials" }, 401));

    const pendingToken = crypto.randomUUID();
    const otp = generateOTP();
    const pending: PendingSession = { userId: user.id, otp, createdAt: Date.now() };
    await env.SENTRY_KV.put(`pending:${pendingToken}`, JSON.stringify(pending), {
      expirationTtl: 300,
    });

    return cors(
      json({
        pendingToken,
        maskedPhone: user.maskedPhone,
        otpHint: otp, // remove in production – for demo only
      })
    );
  }

  if (sub === "verify" && request.method === "POST") {
    const body = (await request.json()) as { pendingToken: string; otp: string };
    const { pendingToken, otp } = body ?? {};
    if (!pendingToken || !otp)
      return cors(json({ error: "Missing fields" }, 400));

    const raw = await env.SENTRY_KV.get(`pending:${pendingToken}`);
    if (!raw) return cors(json({ error: "Session expired or invalid" }, 401));

    const pending: PendingSession = JSON.parse(raw);
    if (pending.otp !== otp.trim())
      return cors(json({ error: "Invalid OTP" }, 401));

    const token = crypto.randomUUID();
    const usersRaw = await env.SENTRY_KV.get("users");
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : defaultUsers();
    const user = users.find((u) => u.id === pending.userId);
    if (!user) return cors(json({ error: "User not found" }, 404));

    const session: Session = { userId: user.id, role: user.role, createdAt: Date.now() };
    await env.SENTRY_KV.put(`session:${token}`, JSON.stringify(session), {
      expirationTtl: 60 * 60 * 24 * 7,
    });
    await env.SENTRY_KV.delete(`pending:${pendingToken}`);

    const { password: _pw, ...safeUser } = user;
    return cors(json({ token, user: safeUser }));
  }

  if (sub === "logout" && request.method === "POST") {
    const token = extractToken(request);
    if (token) await env.SENTRY_KV.delete(`session:${token}`);
    return cors(json({ ok: true }));
  }

  if (sub === "me" && request.method === "GET") {
    const user = await requireAuth(request, env);
    if (!user) return cors(json({ error: "Unauthorized" }, 401));
    const { password: _pw, ...safeUser } = user;
    return cors(json({ user: safeUser }));
  }

  return cors(json({ error: "Not found" }, 404));
}
