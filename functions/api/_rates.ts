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
  // Try KV cache first
  const cached = await env.SENTRY_KV.get(CACHE_KEY);
  if (cached) {
    const parsed: RateMap = JSON.parse(cached);
    // Return if all needed symbols present
    if (symbols.every((s) => s === "USD" || parsed[s] !== undefined)) {
      return parsed;
    }
  }

  // Collect CoinGecko IDs for requested symbols
  const ids = symbols
    .filter((s) => s !== "USD" && COINGECKO_IDS[s])
    .map((s) => COINGECKO_IDS[s]);

  if (ids.length === 0) return { USD: 1 };

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cf: { cacheTtl: CACHE_TTL, cacheEverything: true },
    } as RequestInit);

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

    const data = (await res.json()) as Record<string, { usd: number }>;

    // Build symbol → price map
    const rates: RateMap = { USD: 1, USDC: 1, USDT: 1 };
    for (const [sym, id] of Object.entries(COINGECKO_IDS)) {
      if (data[id]?.usd) rates[sym] = data[id].usd;
    }

    // Cache in KV
    await env.SENTRY_KV.put(CACHE_KEY, JSON.stringify(rates), {
      expirationTtl: CACHE_TTL,
    });

    return rates;
  } catch {
    // On failure return cached even if stale, or hardcoded fallback
    if (cached) return JSON.parse(cached);
    return { BTC: 83000, ETH: 2000, USDC: 1, USDT: 1, SOL: 130, USD: 1 };
  }
}
