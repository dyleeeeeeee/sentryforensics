import type { Env } from "./_types";

const COINGECKO_IDS: Record<string, string> = {
  BTC:  "bitcoin",
  ETH:  "ethereum",
  USDC: "usd-coin",
  SOL:  "solana",
  USDT: "tether",
  BNB:  "binancecoin",
  XRP:  "ripple",
  ADA:  "cardano",
  AVAX: "avalanche-2",
  MATIC: "matic-network",
  DOT:  "polkadot",
  LINK: "chainlink",
  LTC:  "litecoin",
  BCH:  "bitcoin-cash",
  XLM:  "stellar",
};

const CACHE_KEY = "rates:live";
const CACHE_TTL = 60; // seconds

export type RateMap = Record<string, number>; // symbol → USD price

export async function getLiveRates(env: Env, symbols: string[]): Promise<RateMap> {
  // Try KV cache first — return immediately if all requested symbols are present
  const cached = await env.SENTRY_KV.get(CACHE_KEY);
  if (cached) {
    const parsed: RateMap = JSON.parse(cached);
    if (symbols.every((s) => s === "USD" || parsed[s] !== undefined)) {
      return parsed;
    }
  }

  // Always fetch the full known set so the cache is maximally warm
  const allIds = Object.values(COINGECKO_IDS);
  // Build a reverse map: coingecko-id → symbol
  const idToSym: Record<string, string> = {};
  for (const [sym, id] of Object.entries(COINGECKO_IDS)) idToSym[id] = sym;

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${allIds.join(",")}&vs_currencies=usd&precision=6`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (env.COINGECKO_API_KEY) headers["x-cg-demo-api-key"] = env.COINGECKO_API_KEY;

    const res = await fetch(url, {
      headers,
      cf: { cacheTtl: CACHE_TTL, cacheEverything: true },
    } as RequestInit);

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

    const data = (await res.json()) as Record<string, { usd: number }>;

    // Build symbol → price map only from IDs that returned data
    const rates: RateMap = { USD: 1, USDC: 1, USDT: 1 };
    for (const [id, sym] of Object.entries(idToSym)) {
      if (data[id]?.usd) rates[sym] = data[id].usd;
    }

    // Cache in KV
    await env.SENTRY_KV.put(CACHE_KEY, JSON.stringify(rates), {
      expirationTtl: CACHE_TTL,
    });

    return rates;
  } catch {
    // On failure return stale cache if available, otherwise hardcoded fallback
    if (cached) return JSON.parse(cached);
    return { BTC: 83000, ETH: 2000, USDC: 1, USDT: 1, SOL: 130, BNB: 600, XRP: 2.2, USD: 1 };
  }
}
