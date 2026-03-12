import type { Env, User, Asset, Transaction, Card } from "./_types";
import { json, cors, initials } from "./_utils";
import {
  defaultAssets,
  defaultTransactions,
  defaultAccounts,
  defaultLinkedBanks,
  defaultCards,
  defaultTimeline,
  defaultEvidence,
  defaultProfileSettings,
} from "./_defaults";
import { getUserAssets, getUserTransactions } from "./_session";

export async function handleBanking(
  request: Request,
  env: Env,
  segments: string[],
  user: User
): Promise<Response> {
  const sub = segments[1];
  const url = new URL(request.url);

  // GET /api/banking/dashboard
  if (sub === "dashboard" && request.method === "GET") {
    const assets: Asset[] = await getUserAssets(user, env);
    const transactions: Transaction[] = await getUserTransactions(user, env);
    const total = assets.reduce((s, a) => s + a.usd, 0);
    return cors(
      json({
        user: {
          name: user.name,
          caseId: user.caseId,
          initials: initials(user.name),
          role: user.role,
        },
        totalUsd: total,
        recoveredUsd: user.recoveredUsd,
        recoveryRate: user.recoveryRate,
        recoveryComplete: user.recoveryComplete,
        assets,
        recentTransactions: transactions.slice(0, 5),
      })
    );
  }

  // GET /api/banking/transactions
  if (sub === "transactions" && request.method === "GET") {
    const filter = url.searchParams.get("filter") || "All";
    const search = (url.searchParams.get("search") || "").toLowerCase();

    let txs: Transaction[] = await getUserTransactions(user, env);
    if (filter !== "All")
      txs = txs.filter((t) => t.category.toLowerCase() === filter.toLowerCase());
    if (search)
      txs = txs.filter(
        (t) =>
          t.type.toLowerCase().includes(search) ||
          t.asset.toLowerCase().includes(search)
      );

    const credited = txs.filter((t) => t.dir === "in").reduce((s, t) => s + Math.abs(t.usd), 0);
    const debited  = txs.filter((t) => t.dir === "out").reduce((s, t) => s + Math.abs(t.usd), 0);
    const pending  = txs
      .filter((t) => t.status === "pending" || t.status === "processing")
      .reduce((s, t) => s + Math.abs(t.usd), 0);

    return cors(
      json({
        transactions: txs,
        summary: { credited, debited, pending, net: credited - debited },
        total: txs.length,
      })
    );
  }

  // POST /api/banking/transfer
  if (sub === "transfer" && request.method === "POST") {
    const body = (await request.json()) as {
      asset: string;
      amount: number;
      destinationId: string;
      destinationLabel: string;
    };
    if (!body.asset || !body.amount || !body.destinationId)
      return cors(json({ error: "Missing transfer fields" }, 400));

    const assets: Asset[] = await getUserAssets(user, env);
    const asset = assets.find((a) => a.symbol === body.asset);
    if (!asset) return cors(json({ error: "Asset not found" }, 404));
    if (body.amount > asset.amount)
      return cors(json({ error: "Insufficient balance" }, 400));

    const usdValue = body.amount * asset.usdRate;
    const fee = usdValue * 0.005;
    const receiveUsd = usdValue - fee;
    const ref = "TXN-" + Date.now().toString(36).toUpperCase();

    // Deduct from assets
    const updated = assets.map((a) =>
      a.symbol === body.asset
        ? { ...a, amount: +(a.amount - body.amount).toFixed(8), usd: +(a.usd - usdValue).toFixed(2) }
        : a
    );
    await env.SENTRY_KV.put(`assets:${user.id}`, JSON.stringify(updated));

    // Append transaction
    const txs: Transaction[] = await getUserTransactions(user, env);
    const newTx: Transaction = {
      id: ref.toLowerCase(),
      type: `Transfer to ${body.destinationLabel}`,
      asset: body.asset,
      amount: `-${body.amount} ${body.asset}`,
      usd: -usdValue,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "processing",
      category: "transfer",
      dir: "out",
    };
    await env.SENTRY_KV.put(`transactions:${user.id}`, JSON.stringify([newTx, ...txs]));

    return cors(json({ ok: true, ref, fee, receiveUsd }));
  }

  // GET /api/banking/accounts
  if (sub === "accounts" && request.method === "GET") {
    const accountsRaw = await env.SENTRY_KV.get(`accounts:${user.id}`);
    const accounts = accountsRaw ? JSON.parse(accountsRaw) : defaultAccounts();
    const banksRaw = await env.SENTRY_KV.get(`linkedbanks:${user.id}`);
    const linkedBanks = banksRaw ? JSON.parse(banksRaw) : defaultLinkedBanks();
    return cors(json({ accounts, linkedBanks }));
  }

  // GET /api/banking/cards
  if (sub === "cards" && request.method === "GET") {
    const cardsRaw = await env.SENTRY_KV.get(`cards:${user.id}`);
    const cards: Card[] = cardsRaw ? JSON.parse(cardsRaw) : defaultCards();
    return cors(json({ cards }));
  }

  // POST /api/banking/cards/:id/freeze
  if (sub === "cards" && segments[3] === "freeze" && request.method === "POST") {
    const cardId = segments[2];
    const cardsRaw = await env.SENTRY_KV.get(`cards:${user.id}`);
    const cards: Card[] = cardsRaw ? JSON.parse(cardsRaw) : defaultCards();
    const updated = cards.map((c) =>
      c.id === cardId ? { ...c, frozen: !c.frozen } : c
    );
    await env.SENTRY_KV.put(`cards:${user.id}`, JSON.stringify(updated));
    return cors(json({ cards: updated }));
  }

  // GET /api/banking/recovery-status
  if (sub === "recovery-status" && request.method === "GET") {
    const timelineRaw = await env.SENTRY_KV.get(`timeline:${user.id}`);
    const timeline = timelineRaw ? JSON.parse(timelineRaw) : defaultTimeline();
    const evidenceRaw = await env.SENTRY_KV.get(`evidence:${user.id}`);
    const evidence = evidenceRaw ? JSON.parse(evidenceRaw) : defaultEvidence();
    return cors(
      json({
        caseId: user.caseId,
        status: user.recoveryComplete ? "closed – recovered" : "in progress",
        recoveredUsd: user.recoveredUsd,
        recoveryRate: user.recoveryRate,
        recoveryComplete: user.recoveryComplete,
        openedDate: "Feb 3, 2026",
        closedDate: user.recoveryComplete ? "Mar 8, 2026" : undefined,
        originalClaim: 307440,
        recoveryDays: 33,
        networksTraced: 3,
        timeline,
        evidence,
      })
    );
  }

  // GET /api/banking/settings
  if (sub === "settings" && request.method === "GET") {
    const raw = await env.SENTRY_KV.get(`settings:${user.id}`);
    const base = raw ? JSON.parse(raw) : defaultProfileSettings(user);
    const result = {
      name: base.name ?? base.fullName ?? user.name,
      email: base.email ?? user.email,
      phone: base.phone ?? user.maskedPhone,
      caseId: user.caseId,
      clientSince: user.clientSince,
      initials: (base.name ?? user.name).split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
      notifications: base.notifications ?? { email: true, sms: true, app: false },
      privacy: base.privacy ?? base.security ?? { twoFactor: true, biometric: false, sessionLock: true },
    };
    return cors(json(result));
  }

  // POST /api/banking/settings
  if (sub === "settings" && request.method === "POST") {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = await env.SENTRY_KV.get(`settings:${user.id}`);
    const current = existing ? JSON.parse(existing) : defaultProfileSettings(user);
    const merged = { ...current, ...body };
    await env.SENTRY_KV.put(`settings:${user.id}`, JSON.stringify(merged));
    return cors(json({ ok: true, settings: merged }));
  }

  return cors(json({ error: "Not found" }, 404));
}
