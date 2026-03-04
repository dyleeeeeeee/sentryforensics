import { Container } from "@/components/Container";
import { GlassCard } from "@/components/GlassCard";

export const metadata = {
  title: "Services",
};

export default function ServicesPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-6">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Services
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              Sentry Forensics provides a structured, evidence-led assessment of crypto loss
              scenarios using safe inputs and clear operating boundaries.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard>
              <h2 className="text-lg font-semibold text-white">Wallet access issues</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Device migrations, legacy wallet formats, password loss scenarios, and recovery
                planning—based only on information you can safely disclose.
              </p>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold text-white">Scam / phishing analysis</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Timeline reconstruction and evidence organization using public addresses,
                transaction hashes, and communication context—without collecting secrets.
              </p>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold text-white">Exchange & account incidents</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Guidance for support escalation and documentation. We can reference ticket IDs
                and public records—never credentials or remote access.
              </p>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold text-white">Wrong network / routing</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Technical assessment of what happened and which options may exist based on chain,
                asset, and transaction specifics.
              </p>
            </GlassCard>
          </div>

          <p className="text-xs leading-5 text-white/55">
            We never request seed phrases, private keys, wallet backup files, or remote access.
          </p>
        </div>
      </Container>
    </main>
  );
}
