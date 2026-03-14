import type { Env, User, Session } from "./_types";
import { json, cors, extractToken } from "./_utils";
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
    if (!usersRaw) return cors(json({ error: "Invalid credentials" }, 401));
    const users: User[] = JSON.parse(usersRaw);

    const user = users.find(
      (u) =>
        (u.caseId.toLowerCase() === identifier.toLowerCase() ||
          u.email.toLowerCase() === identifier.toLowerCase()) &&
        u.password === password
    );
    if (!user) return cors(json({ error: "Invalid credentials" }, 401));
    if (user.blocked) return cors(json({ error: "Account suspended. Contact support." }, 403));

    const token = crypto.randomUUID();
    const session: Session = { userId: user.id, role: user.role, createdAt: Date.now() };
    await env.SENTRY_KV.put(`session:${token}`, JSON.stringify(session), {
      expirationTtl: 60 * 60 * 24 * 7,
    });

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
