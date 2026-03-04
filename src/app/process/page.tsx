import { Container } from "@/components/Container";
import { GlassCard } from "@/components/GlassCard";

export const metadata = {
  title: "Process",
};

export default function ProcessPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-6">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Process
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              A clear, safety-first workflow focused on evidence and verifiable details.
            </p>
          </header>

          <div className="grid gap-4">
            <GlassCard>
              <h2 className="text-base font-semibold text-white">1) Case intake</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                You provide a structured incident narrative and timeline, plus public identifiers
                (addresses, transaction hashes, and exchange ticket IDs). We explicitly block
                secrets.
              </p>
            </GlassCard>

            <GlassCard>
              <h2 className="text-base font-semibold text-white">2) Triage & validation</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                We classify the event, de-duplicate signals, and validate what can be corroborated
                from public blockchain data and artifacts you can safely provide.
              </p>
            </GlassCard>

            <GlassCard>
              <h2 className="text-base font-semibold text-white">3) Assessment summary</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                You receive a concise assessment brief: findings, confidence boundaries, and
                recommended next steps—along with a transparent statement of limitations.
              </p>
            </GlassCard>
          </div>

          <p className="text-xs leading-5 text-white/55">
            Disclaimer: We do not custody funds. Outcomes vary by scenario.
          </p>
        </div>
      </Container>
    </main>
  );
}
