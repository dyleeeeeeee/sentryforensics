import { Container } from "@/components/Container";
import { GlassCard } from "@/components/GlassCard";
import { IntakeFlow } from "@/components/IntakeFlow";

export const metadata = {
  title: "Intake",
};

export default function RecoverWalletPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-6">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl animate-fade-in">
              Intake
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base animate-fade-in-delay">
              Provide non-sensitive, verifiable details only. We do not request
              seed phrases, private keys, wallet backups, or remote access.
            </p>
          </header>

          <GlassCard>
            <IntakeFlow />
          </GlassCard>

          <div className="glass-card rounded-3xl p-6 scroll-animate animate-slide-up">
            <p className="text-sm font-semibold text-white">Operational notice</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              To complete your process, you will need to provide your proof of payment to a live agent by clicking the button in the bottom right.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
