import type { Env, IntakeSubmission } from "./_types";
import { json, cors } from "./_utils";

export async function handleAdmin(
  request: Request,
  env: Env,
  segments: string[]
): Promise<Response> {
  const sub = segments[1];

  // GET /api/admin/cases
  if (sub === "cases" && request.method === "GET") {
    const raw = await env.SENTRY_KV.get("intake:list");
    const cases: IntakeSubmission[] = raw ? JSON.parse(raw) : [];
    return cors(json({ cases, total: cases.length }));
  }

  // PATCH /api/admin/cases/:id
  if (sub === "cases" && segments[2] && request.method === "PATCH") {
    const id = segments[2];
    const body = (await request.json()) as { status: IntakeSubmission["status"] };
    const raw = await env.SENTRY_KV.get(`intake:${id}`);
    if (!raw) return cors(json({ error: "Case not found" }, 404));
    const submission: IntakeSubmission = JSON.parse(raw);
    submission.status = body.status ?? submission.status;
    await env.SENTRY_KV.put(`intake:${id}`, JSON.stringify(submission));

    // Update list too
    const listRaw = await env.SENTRY_KV.get("intake:list");
    if (listRaw) {
      const list: IntakeSubmission[] = JSON.parse(listRaw);
      const updated = list.map((c) => (c.id === id ? submission : c));
      await env.SENTRY_KV.put("intake:list", JSON.stringify(updated));
    }
    return cors(json({ ok: true, case: submission }));
  }

  // GET /api/admin/users
  if (sub === "users" && request.method === "GET") {
    const raw = await env.SENTRY_KV.get("users");
    const { defaultUsers } = await import("./_defaults");
    const users = raw ? JSON.parse(raw) : defaultUsers();
    // Strip passwords
    const safe = users.map(({ password: _pw, ...u }: { password: string; [k: string]: unknown }) => u);
    return cors(json({ users: safe, total: safe.length }));
  }

  return cors(json({ error: "Not found" }, 404));
}
