import type { Env, User, Asset, IntakeSubmission } from "./_types";
import { json, cors } from "./_utils";
import { defaultUsers, defaultAssets } from "./_defaults";

async function getUsers(env: Env): Promise<User[]> {
  const raw = await env.SENTRY_KV.get("users");
  if (raw) return JSON.parse(raw);
  const seeded = defaultUsers();
  await env.SENTRY_KV.put("users", JSON.stringify(seeded));
  return seeded;
}

async function saveUsers(env: Env, users: User[]): Promise<void> {
  await env.SENTRY_KV.put("users", JSON.stringify(users));
}

export async function handleAdmin(
  request: Request,
  env: Env,
  segments: string[]
): Promise<Response> {
  const sub = segments[1];
  const id = segments[2];
  const action = segments[3];

  // GET /api/admin/cases
  if (sub === "cases" && !id && request.method === "GET") {
    const raw = await env.SENTRY_KV.get("intake:list");
    const cases: IntakeSubmission[] = raw ? JSON.parse(raw) : [];
    return cors(json({ cases, total: cases.length }));
  }

  // PATCH /api/admin/cases/:id
  if (sub === "cases" && id && request.method === "PATCH") {
    const body = (await request.json()) as { status: IntakeSubmission["status"] };
    const raw = await env.SENTRY_KV.get(`intake:${id}`);
    if (!raw) return cors(json({ error: "Case not found" }, 404));
    const submission: IntakeSubmission = JSON.parse(raw);
    submission.status = body.status ?? submission.status;
    await env.SENTRY_KV.put(`intake:${id}`, JSON.stringify(submission));
    const listRaw = await env.SENTRY_KV.get("intake:list");
    if (listRaw) {
      const list: IntakeSubmission[] = JSON.parse(listRaw);
      await env.SENTRY_KV.put("intake:list", JSON.stringify(list.map((c) => (c.id === id ? submission : c))));
    }
    return cors(json({ ok: true, case: submission }));
  }

  // GET /api/admin/users
  if (sub === "users" && !id && request.method === "GET") {
    const users = await getUsers(env);
    const safe = users.map(({ password: _pw, ...u }) => u);
    return cors(json({ users: safe, total: safe.length }));
  }

  // POST /api/admin/users — create new portal user
  if (sub === "users" && !id && request.method === "POST") {
    const body = (await request.json()) as {
      name: string; email: string; password: string; caseId: string;
      maskedPhone?: string; role?: "client" | "admin";
      recoveredUsd?: number; recoveryRate?: number;
      recoveryComplete?: boolean; clientSince?: string;
    };
    if (!body.name || !body.email || !body.password || !body.caseId)
      return cors(json({ error: "Missing required fields: name, email, password, caseId" }, 400));
    const users = await getUsers(env);
    if (users.find((u) => u.caseId === body.caseId))
      return cors(json({ error: "Case ID already in use" }, 409));
    if (users.find((u) => u.email.toLowerCase() === body.email.toLowerCase()))
      return cors(json({ error: "Email already in use" }, 409));
    const now = new Date();
    const newUser: User = {
      id: "u" + Date.now().toString(36),
      name: body.name,
      email: body.email,
      password: body.password,
      caseId: body.caseId,
      maskedPhone: body.maskedPhone ?? "+•• •••• ••••",
      role: body.role ?? "client",
      recoveredUsd: body.recoveredUsd ?? 0,
      recoveryRate: body.recoveryRate ?? 0,
      recoveryComplete: body.recoveryComplete ?? false,
      clientSince: body.clientSince ?? now.toLocaleString("en-US", { month: "short", year: "numeric" }),
      blocked: false,
    };
    users.push(newUser);
    await saveUsers(env, users);
    // Seed initial assets
    const initAssets: Asset[] = (newUser.recoveredUsd > 0)
      ? [{ symbol: "USDC", name: "USD Coin", amount: newUser.recoveredUsd, usd: newUser.recoveredUsd, usdRate: 1, change: 0.01, color: "#00d4ff", icon: "$" }]
      : [];
    await env.SENTRY_KV.put(`assets:${newUser.id}`, JSON.stringify(initAssets));
    const { password: _pw, ...safe } = newUser;
    return cors(json({ ok: true, user: safe }, 201));
  }

  // PATCH /api/admin/users/:id — edit profile/credentials
  if (sub === "users" && id && !action && request.method === "PATCH") {
    const body = (await request.json()) as Partial<User>;
    const users = await getUsers(env);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return cors(json({ error: "User not found" }, 404));
    // Prevent overwriting id
    const { id: _id, ...patch } = body as User;
    users[idx] = { ...users[idx], ...patch };
    await saveUsers(env, users);
    const { password: _pw, ...safe } = users[idx];
    return cors(json({ ok: true, user: safe }));
  }

  // POST /api/admin/users/:id/block
  if (sub === "users" && id && action === "block" && request.method === "POST") {
    const users = await getUsers(env);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return cors(json({ error: "User not found" }, 404));
    users[idx].blocked = true;
    await saveUsers(env, users);
    return cors(json({ ok: true }));
  }

  // POST /api/admin/users/:id/unblock
  if (sub === "users" && id && action === "unblock" && request.method === "POST") {
    const users = await getUsers(env);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return cors(json({ error: "User not found" }, 404));
    users[idx].blocked = false;
    await saveUsers(env, users);
    return cors(json({ ok: true }));
  }

  // GET /api/admin/users/:id/assets
  if (sub === "users" && id && action === "assets" && request.method === "GET") {
    const raw = await env.SENTRY_KV.get(`assets:${id}`);
    const assets: Asset[] = raw ? JSON.parse(raw) : defaultAssets();
    return cors(json({ assets }));
  }

  // PUT /api/admin/users/:id/assets — overwrite user asset balances
  if (sub === "users" && id && action === "assets" && request.method === "PUT") {
    const body = (await request.json()) as { assets: Asset[] };
    if (!Array.isArray(body.assets)) return cors(json({ error: "assets must be an array" }, 400));
    await env.SENTRY_KV.put(`assets:${id}`, JSON.stringify(body.assets));
    // Keep recoveredUsd in sync
    const total = body.assets.reduce((s: number, a: Asset) => s + a.usd, 0);
    const users = await getUsers(env);
    const idx = users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      users[idx].recoveredUsd = total;
      await saveUsers(env, users);
    }
    return cors(json({ ok: true, assets: body.assets }));
  }

  // GET /api/admin/users/:id/timeline
  if (sub === "users" && id && action === "timeline" && request.method === "GET") {
    const raw = await env.SENTRY_KV.get(`timeline:${id}`);
    const timeline = raw ? JSON.parse(raw) : [];
    return cors(json({ timeline }));
  }

  // GET /api/admin/users/:id/evidence
  if (sub === "users" && id && action === "evidence" && request.method === "GET") {
    const raw = await env.SENTRY_KV.get(`evidence:${id}`);
    const evidence = raw ? JSON.parse(raw) : [];
    return cors(json({ evidence }));
  }

  // PUT /api/admin/users/:id/timeline
  if (sub === "users" && id && action === "timeline" && request.method === "PUT") {
    const body = (await request.json()) as { timeline: unknown[] };
    if (!Array.isArray(body.timeline)) return cors(json({ error: "timeline must be an array" }, 400));
    await env.SENTRY_KV.put(`timeline:${id}`, JSON.stringify(body.timeline));
    return cors(json({ ok: true }));
  }

  // PUT /api/admin/users/:id/evidence
  if (sub === "users" && id && action === "evidence" && request.method === "PUT") {
    const body = (await request.json()) as { evidence: unknown[] };
    if (!Array.isArray(body.evidence)) return cors(json({ error: "evidence must be an array" }, 400));
    await env.SENTRY_KV.put(`evidence:${id}`, JSON.stringify(body.evidence));
    return cors(json({ ok: true }));
  }

  // PUT /api/admin/users/:id/accounts
  if (sub === "users" && id && action === "accounts" && request.method === "PUT") {
    const body = (await request.json()) as { accounts: unknown[] };
    if (!Array.isArray(body.accounts)) return cors(json({ error: "accounts must be an array" }, 400));
    await env.SENTRY_KV.put(`accounts:${id}`, JSON.stringify(body.accounts));
    return cors(json({ ok: true }));
  }

  // PUT /api/admin/users/:id/linkedbanks
  if (sub === "users" && id && action === "linkedbanks" && request.method === "PUT") {
    const body = (await request.json()) as { linkedBanks: unknown[] };
    if (!Array.isArray(body.linkedBanks)) return cors(json({ error: "linkedBanks must be an array" }, 400));
    await env.SENTRY_KV.put(`linkedbanks:${id}`, JSON.stringify(body.linkedBanks));
    return cors(json({ ok: true }));
  }

  // PUT /api/admin/users/:id/cards
  if (sub === "users" && id && action === "cards" && request.method === "PUT") {
    const body = (await request.json()) as { cards: unknown[] };
    if (!Array.isArray(body.cards)) return cors(json({ error: "cards must be an array" }, 400));
    await env.SENTRY_KV.put(`cards:${id}`, JSON.stringify(body.cards));
    return cors(json({ ok: true }));
  }

  // PUT /api/admin/users/:id/transactions
  if (sub === "users" && id && action === "transactions" && request.method === "PUT") {
    const body = (await request.json()) as { transactions: unknown[] };
    if (!Array.isArray(body.transactions)) return cors(json({ error: "transactions must be an array" }, 400));
    await env.SENTRY_KV.put(`transactions:${id}`, JSON.stringify(body.transactions));
    return cors(json({ ok: true }));
  }

  return cors(json({ error: "Not found" }, 404));
}
