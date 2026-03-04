import Link from "next/link";

import { Container } from "@/components/Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/10 bg-black/20">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(103,232,249,0.12),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(167,139,250,0.10),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(52,211,153,0.08),transparent_40%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <Container className="relative py-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/90">
                  <span className="text-xs font-semibold tracking-[0.22em]">SF</span>
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Sentry Forensics</p>
                  <p className="mt-1 text-xs text-white/55">
                    FIELD INTELLIGENCE • DIGITAL ASSET RECOVERY
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold tracking-[0.22em] text-white/70">
                  OPERATIONS BRIEF
                </p>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Evidence-led crypto incident assessment. Privacy-aware intake. We do not request
                  seed phrases, private keys, wallet backups, or remote access.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-medium text-white/70">
                    NON-CUSTODIAL
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-medium text-white/70">
                    SECURE INTAKE
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-medium text-white/70">
                    TRACE & ATTRIBUTION
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-white/70">OPERATIONS</p>
                <ul className="mt-4 grid gap-2 text-sm text-white/75">
                  <li>
                    <Link className="hover:text-white" href="/services">
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-white" href="/process">
                      Process
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-white" href="/recover-wallet">
                      Secure intake
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-white/70">RESOURCES</p>
                <ul className="mt-4 grid gap-2 text-sm text-white/75">
                  <li>
                    <Link className="hover:text-white" href="/docs">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-white" href="/faq">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-white" href="/contact">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-white/70">COMMUNICATIONS</p>
                <div className="mt-4 grid gap-3">
                  <a
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:border-white/20 hover:text-white"
                    href="https://sentryforensics.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    sentryforensics.com
                  </a>
                  <p className="text-xs leading-5 text-white/55">
                    Operational note: outcomes vary by scenario, timing, and evidence. We do not
                    guarantee recovery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/50">© {year} Sentry Forensics</p>
            <div className="flex items-center gap-3 text-xs text-white/55">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                INTAKE: AVAILABLE
              </span>
              <span className="hidden h-4 w-px bg-white/10 sm:block" />
              <span className="font-mono tracking-[0.14em]">CLEARANCE: PUBLIC</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
