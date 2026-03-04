import Link from "next/link";

import { Container } from "@/components/Container";
import { GlassCard } from "@/components/GlassCard";

export const metadata = {
  title: "Secure intake practices",
};

export default function SecureIntakeDoc() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-6">
          <header>
            <p className="text-xs font-medium text-white/60">Docs</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Secure intake practices
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              Operational guidance for sharing information safely during a crypto incident.
            </p>
          </header>

          <GlassCard>
            <div className="grid gap-6">
              <section>
                <h2 className="text-base font-semibold text-white">Safe to share</h2>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-white/70">
                  <li>Public wallet addresses</li>
                  <li>Transaction hashes (txid)</li>
                  <li>Exchange ticket IDs</li>
                  <li>Approximate timing and a narrative of events</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-white">Never share</h2>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-white/70">
                  <li>Seed phrases / recovery phrases</li>
                  <li>Private keys</li>
                  <li>Wallet backup files</li>
                  <li>Remote access credentials or screen-sharing access</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-white">Red flags</h2>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-white/70">
                  <li>Requests for upfront deposits to “verify” or “unlock” recovery</li>
                  <li>Pressure tactics or time-limited threats</li>
                  <li>Requests to install unknown software or grant remote control</li>
                </ul>
              </section>

              <p className="text-xs leading-5 text-white/55">
                Disclaimer: This document is general safety guidance and not legal advice.
              </p>
            </div>
          </GlassCard>

          <div className="text-sm">
            <Link className="text-white/80 hover:text-white" href="/">
              ← Back to home
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
