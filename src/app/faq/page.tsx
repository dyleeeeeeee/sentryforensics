import { Container } from "@/components/Container";
import { GlassCard } from "@/components/GlassCard";

export const metadata = {
  title: "FAQ",
};

export default function FaqPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-6">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              FAQ
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              High-assurance answers with strict boundaries. No hype, no guarantees.
            </p>
          </header>

          <div className="grid gap-4">
            <GlassCard>
              <h2 className="text-base font-semibold text-white">
                Do you need my seed phrase or private key?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                No. Do not share seed phrases or private keys. We operate on safe inputs only
                (public addresses, transaction hashes, exchange ticket IDs, and a narrative).
              </p>
            </GlassCard>

            <GlassCard>
              <h2 className="text-base font-semibold text-white">
                Can you guarantee recovery?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                No. Outcomes depend on the scenario, timing, counterparties, and what can be
                corroborated from evidence.
              </p>
            </GlassCard>

            <GlassCard>
              <h2 className="text-base font-semibold text-white">
                Should I send funds to "unlock" or "verify" recovery?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                No. Treat requests for upfront payments, "verification" deposits, or remote access
                as high-risk indicators.
              </p>
            </GlassCard>
          </div>
        </div>
      </Container>
    </main>
  );
}
