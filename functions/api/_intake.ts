import type { Env, IntakeSubmission } from "./_types";
import { json, cors } from "./_utils";

export async function handleIntake(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as Record<string, string | boolean>;

  if (!body.fullName || !body.email || !body.narrative) {
    return cors(json({ error: "Missing required fields" }, 400));
  }

  // Honeypot check
  if (body.honeypot) {
    return cors(json({ ok: true })); // silently drop spam
  }

  const id = "SF-" + Date.now().toString(36).toUpperCase();
  const submission: IntakeSubmission = {
    id,
    submittedAt: new Date().toISOString(),
    fullName: String(body.fullName),
    email: String(body.email),
    contactChannel: String(body.contactChannel || "email"),
    incidentType: String(body.incidentType || "other"),
    incidentDate: String(body.incidentDate || ""),
    narrative: String(body.narrative),
    publicAddresses: String(body.publicAddresses || ""),
    txids: String(body.txids || ""),
    exchangeTicketIds: String(body.exchangeTicketIds || ""),
    lossEstimate: String(body.lossEstimate || ""),
    status: "new",
  };

  // Store in KV list
  const listRaw = await env.SENTRY_KV.get("intake:list");
  const list: IntakeSubmission[] = listRaw ? JSON.parse(listRaw) : [];
  list.unshift(submission);
  await env.SENTRY_KV.put("intake:list", JSON.stringify(list));
  await env.SENTRY_KV.put(`intake:${id}`, JSON.stringify(submission));

  return cors(json({ ok: true, caseId: id }));
}
