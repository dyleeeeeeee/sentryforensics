/// <reference types="@cloudflare/workers-types" />
/**
 * Sentry Forensics – Cloudflare Pages Functions Worker
 * Route: /api/*
 */

import { handleAuth } from "./_auth";
import { handleBanking } from "./_banking";
import { handleIntake } from "./_intake";
import { handleAdmin } from "./_admin";
import { cors, json } from "./_utils";
import { requireAuth } from "./_session";

interface Env {
  SENTRY_KV: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  if (request.method === "OPTIONS") {
    return cors(new Response(null, { status: 204 }));
  }

  const segments: string[] = Array.isArray(params.route)
    ? params.route
    : typeof params.route === "string"
    ? params.route.split("/").filter(Boolean)
    : [];

  try {
    if (segments[0] === "auth") return handleAuth(request, env, segments);

    if (segments[0] === "banking") {
      const user = await requireAuth(request, env);
      if (!user) return cors(json({ error: "Unauthorized" }, 401));
      return handleBanking(request, env, segments, user);
    }

    if (segments[0] === "intake" && request.method === "POST") {
      return handleIntake(request, env);
    }

    if (segments[0] === "admin") {
      const user = await requireAuth(request, env);
      if (!user) return cors(json({ error: "Unauthorized" }, 401));
      if (user.role !== "admin") return cors(json({ error: "Forbidden" }, 403));
      return handleAdmin(request, env, segments);
    }

    return cors(json({ error: "Not found" }, 404));
  } catch (err) {
    console.error(err);
    return cors(json({ error: "Internal server error" }, 500));
  }
};
