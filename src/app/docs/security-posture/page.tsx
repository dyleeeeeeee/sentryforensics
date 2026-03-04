import Link from "next/link";

import { Container } from "@/components/Container";
import { GlassCard } from "@/components/GlassCard";

export const metadata = {
  title: "Security posture",
};

export default function SecurityPostureDoc() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-6">
          <header>
            <p className="text-xs font-medium text-white/60">Docs</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Security posture
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              How Sentry Forensics approaches safety, privacy, and trust when handling case
              intake information.
            </p>
          </header>

          <GlassCard>
            <div className="grid gap-4">
              <section>
                <h2 className="text-base font-semibold text-white">Principles</h2>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-white/70">
                  <li>
                    <span className="text-white">Data minimization:</span> we only ask for what we
                    need.
                  </li>
                  <li>
                    <span className="text-white">Non-custodial by design:</span> we do not take
                    custody of funds.
                  </li>
                  <li>
                    <span className="text-white">No secrets:</span> we never request seed phrases,
                    private keys, or wallet backup files.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-white">What we store</h2>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Case narratives, timelines, and public blockchain identifiers (e.g. public
                  addresses and transaction hashes). Where possible, we avoid collecting sensitive
                  personal information and we keep intake scope intentionally narrow.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-white">What we never ask for</h2>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-white/70">
                  <li>Seed phrases or private keys</li>
                  <li>Wallet backup files</li>
                  <li>Remote access credentials</li>
                  <li>Payments to “unlock” or “verify” recovery</li>
                </ul>
              </section>
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
