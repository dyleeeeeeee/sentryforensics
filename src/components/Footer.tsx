import Link from "next/link";
import { Container } from "@/components/Container";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t" style={{ borderColor: "var(--glass-border)", background: "rgba(4,6,13,0.6)" }}>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(circle at 10% 0%, rgba(0,212,255,0.1), transparent 40%), radial-gradient(circle at 90% 20%, rgba(157,111,255,0.08), transparent 45%), radial-gradient(circle at 50% 100%, rgba(0,240,160,0.07), transparent 40%)"
          }}/>
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "64px 64px"
          }}/>
        </div>

        <Container className="relative py-14">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border text-white/90"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", borderColor: "var(--glass-border)", background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(157,111,255,0.1))" }}>
                  SF
                </span>
                <div>
                  <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Sentry Forensics</p>
                  <p className="mt-0.5 text-[10px] tracking-[0.2em] text-white/40" style={{ fontFamily: "var(--font-mono)" }}>FIELD INTELLIGENCE · DIGITAL ASSET RECOVERY</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl p-5" style={{ background: "var(--glass-2)", border: "1px solid var(--glass-border)" }}>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-white/50 mb-3" style={{ fontFamily: "var(--font-mono)" }}>OPERATIONS BRIEF</p>
                <p className="text-sm leading-6 text-white/65">
                  Evidence-led crypto incident assessment. Privacy-aware intake. We do not request seed phrases, private keys, wallet backups, or remote access.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["NON-CUSTODIAL", "SECURE INTAKE", "TRACE & ATTRIBUTION"].map((tag) => (
                    <span key={tag} className="badge badge-teal">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3 lg:col-span-7">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-white/45 mb-4" style={{ fontFamily: "var(--font-mono)" }}>OPERATIONS</p>
                <ul className="space-y-2.5">
                  {[["Services", "/services"], ["Process", "/process"], ["Secure Intake", "/recover-wallet"], ["Banking Portal", "/banking"]].map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-white/55 hover:text-white transition-colors duration-200 font-medium">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-white/45 mb-4" style={{ fontFamily: "var(--font-mono)" }}>RESOURCES</p>
                <ul className="space-y-2.5">
                  {[["Documentation", "/docs"], ["FAQ", "/faq"], ["Contact", "/contact"]].map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-white/55 hover:text-white transition-colors duration-200 font-medium">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-white/45 mb-4" style={{ fontFamily: "var(--font-mono)" }}>COMMS</p>
                <div className="space-y-3">
                  <a href="https://sentryforensics.com" target="_blank" rel="noreferrer"
                    className="block rounded-xl px-4 py-3 text-sm text-white/70 hover:text-white transition-all duration-200"
                    style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}>
                    sentryforensics.com
                  </a>
                  <p className="text-xs leading-5 text-white/40">Outcomes vary by scenario, timing, and evidence. We do not guarantee recovery.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderTop: "1px solid var(--glass-border)" }}>
            <p className="text-xs text-white/35">© {year} Sentry Forensics. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-white/45" style={{ fontFamily: "var(--font-mono)" }}>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full animate-pulse-dot" style={{ background: "var(--accent-emerald)" }}/>
                INTAKE: ACTIVE
              </span>
              <span className="hidden h-3 w-px sm:block" style={{ background: "var(--glass-border)" }}/>
              <span className="tracking-[0.15em]">CLEARANCE: PUBLIC</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
