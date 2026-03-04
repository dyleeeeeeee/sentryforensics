import { Container } from "@/components/Container";
import { GlassCard } from "@/components/GlassCard";
import { OpenChatwayButton } from "@/components/OpenChatwayButton";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-6">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Contact
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              Reach out with non-sensitive, verifiable details only. Do not send seed phrases,
              private keys, wallet backups, or remote access information.
            </p>
          </header>

          <GlassCard>
            <div className="grid gap-4">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-white">
                  Primary channels
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Use email for structured, evidence-led communication. Use Live Chat for quick
                  triage and next steps.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  className="group glass-card px-4 py-4 transition hover:border-white/20"
                  href="mailto:contact@sentryforensics.com"
                >
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                    Email
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    contact@sentryforensics.com
                  </div>
                  <div className="mt-1 text-xs leading-5 text-white/55">
                    Recommended for case details, timelines, and screenshots.
                  </div>
                </a>

                <div className="glass-card px-4 py-4">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                    Live Chat
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">Secure triage</div>
                  <div className="mt-1 text-xs leading-5 text-white/55">
                    Use this for quick questions and immediate routing.
                  </div>
                  <div className="mt-3">
                    <OpenChatwayButton className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90">
                      Open Live Chat
                    </OpenChatwayButton>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/55">
              Tip: If anyone asks for your seed phrase, private key, wallet backup file, or remote
              access—stop.
            </p>
          </GlassCard>
        </div>
      </Container>
    </main>
  );
}
