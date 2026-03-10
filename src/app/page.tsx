"use client";
import { useEffect, type ReactNode } from "react";
import Link from "next/link";

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div className={`scroll-animate ${className ?? ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const STATS = [
  { value: "98%", label: "Recovery Rate", desc: "Industry-leading success" },
  { value: "$2.5M+", label: "Assets Recovered", desc: "Across all networks" },
  { value: "1,200+", label: "Cases Closed", desc: "Satisfied clients" },
  { value: "72hrs", label: "Avg. First Contact", desc: "Fast initial analysis" },
];

const CRYPTO_TYPES = [
  { icon: "₿", name: "Bitcoin", color: "#f59e0b", desc: "BTC recovery from corrupted wallets, forgotten pass phrases" },
  { icon: "Ξ", name: "Ethereum", color: "#9d6fff", desc: "ETH, NFTs, DeFi tokens, ERC-20 assets" },
  { icon: "◎", name: "Solana", color: "#00f0a0", desc: "SOL and Solana-native token recovery" },
  { icon: "$", name: "Stablecoins", color: "#00d4ff", desc: "USDC, USDT, DAI from frozen or hacked accounts" },
  { icon: "⬡", name: "Hardware Wallets", color: "#a78bfa", desc: "Ledger, Trezor, and other hardware wallet issues" },
  { icon: "⇄", name: "Exchange Accounts", color: "#34d399", desc: "Compromised exchange accounts and unauthorized transfers" },
];

export default function HomePage() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".scroll-animate"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).classList.add("visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );
    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden">

      {/* ── HERO ─────────────────────────────── */}
      <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}/>
        {/* Glow orbs */}
        <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 70%)", filter: "blur(40px)" }}/>
        <div className="absolute top-0 right-1/4 h-80 w-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(157,111,255,0.09) 0%, transparent 70%)", filter: "blur(50px)" }}/>

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 animate-fade-in"
                style={{ background: "var(--accent-teal-dim)", border: "1px solid rgba(0,212,255,0.2)" }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse-dot" style={{ background: "var(--accent-teal)" }}/>
                <span className="text-xs font-semibold tracking-wide" style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)" }}>
                  INTAKE NOW OPEN · 98% RECOVERY RATE
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight mb-5 animate-fade-in-delay"
                style={{ fontFamily: "var(--font-display)" }}>
                <span className="text-white">Recover Your</span>
                <br/>
                <span style={{ background: "linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-violet) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Lost Crypto
                </span>
                <br/>
                <span className="text-white">Assets</span>
              </h1>

              <p className="text-lg text-white/55 leading-7 max-w-md animate-slide-up" style={{ fontFamily: "var(--font-body)" }}>
                Advanced blockchain forensics and expert recovery specialists. We trace, attribute, and recover lost or stolen cryptocurrency with industry-leading precision.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 animate-slide-up">
                <Link href="/recover-wallet"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #00d4ff, #9d6fff)", color: "#04060d", boxShadow: "0 8px 32px rgba(0,212,255,0.25)" }}>
                  Start Recovery Case
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link href="/process"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--glass-2)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)" }}>
                  How It Works
                </Link>
              </div>

              {/* <p className="mt-5 text-xs text-white/30 animate-slide-up" style={{ fontFamily: "var(--font-mono)" }}>
                NO UPFRONT FEE · NO SEED PHRASES · NO PRIVATE KEYS
              </p> */}
            </div>

            {/* Hero card */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 animate-slide-in-right" style={{ border: "1px solid var(--glass-border-accent)" }}>
              <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)" }}/>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-white/35 tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>WHY CHOOSE US</p>
                  <h2 className="text-lg font-bold text-white mt-1" style={{ fontFamily: "var(--font-display)" }}>Forensic-Grade Recovery</h2>
                </div>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--accent-teal-dim)", border: "1px solid rgba(0,212,255,0.2)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: "Blockchain Forensics", desc: "Deep chain tracing across BTC, ETH, and 40+ networks", color: "var(--accent-teal)", icon: "⛓" },
                  // { title: "No Upfront Fee", desc: "You only pay when we successfully recover your assets", color: "var(--accent-emerald)", icon: "✓" },
                  { title: "24/7 Expert Team", desc: "Dedicated case managers available around the clock", color: "var(--accent-violet)", icon: "👁" },
                  { title: "Legal Support", desc: "Law enforcement liaison and legal recovery motions", color: "var(--gold-400)", icon: "⚖" },
                ].map(item => (
                  <div key={item.title} className="rounded-2xl p-4 hover-lift cursor-default"
                    style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}>
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-sm font-semibold text-white mt-2">{item.title}</p>
                    <p className="text-xs text-white/45 mt-1 leading-4">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg, rgba(0,240,160,0.06), rgba(0,212,255,0.04))", border: "1px solid rgba(0,240,160,0.12)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                <p className="text-sm text-white/70">
                  <span className="font-semibold text-white">Successful Recovery?</span>{" "}
                  Access your funds in the <Link href="/banking" className="underline decoration-dotted" style={{ color: "var(--accent-teal)" }}>Banking Portal →</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────── */}
      <section className="py-14 relative" style={{ borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)", background: "var(--glass-1)" }}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 60}>
                <div className="text-center">
                  <p className="text-4xl font-extrabold mb-1"
                    style={{ fontFamily: "var(--font-display)", background: "linear-gradient(135deg, #fff, rgba(255,255,255,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {stat.value}
                  </p>
                  <p className="text-sm font-semibold text-white/80">{stat.label}</p>
                  <p className="text-xs text-white/35 mt-0.5">{stat.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ─────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <p className="badge badge-teal mx-auto mb-4" style={{ display: "inline-flex" }}>RECOVERY PROCESS</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>
                From Loss to Recovery
              </h2>
              <p className="mt-3 text-white/45 max-w-md mx-auto">Three clear phases, one outcome: your assets returned.</p>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n: "01", title: "Initial Consultation", desc: "Submit your case via our secure intake portal. No seed phrases, no private keys. Just transaction details and your timeline.", color: "var(--accent-teal)" },
              { n: "02", title: "Forensic Analysis", desc: "Our blockchain investigators trace your assets across chains, identify threat actors, and build the evidence portfolio for recovery.", color: "var(--accent-violet)" },
              { n: "03", title: "Recovery & Return", desc: "We execute the recovery — legally, technically, and securely. Funds are returned directly to your wallet or our banking portal.", color: "var(--accent-emerald)" },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 80}>
                <div className="glass-card rounded-2xl p-6 hover-lift h-full">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl font-extrabold leading-none" style={{ fontFamily: "var(--font-display)", color: step.color, opacity: 0.5 }}>{step.n}</span>
                    <div>
                      <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>{step.title}</h3>
                      <p className="text-sm text-white/50 leading-6">{step.desc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE RECOVER ─────────────────────── */}
      <section className="py-20" style={{ background: "var(--glass-1)", borderTop: "1px solid var(--glass-border)" }}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <p className="badge badge-violet mx-auto mb-4" style={{ display: "inline-flex" }}>COVERAGE</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>We Recover All Crypto</h2>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CRYPTO_TYPES.map((crypto, i) => (
              <Reveal key={crypto.name} delay={i * 60}>
                <div className="glass-card rounded-2xl p-5 hover-lift flex items-start gap-4">
                  <span className="h-11 w-11 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                    style={{ background: `${crypto.color}15`, color: crypto.color, fontFamily: "var(--font-mono)", border: `1px solid ${crypto.color}25` }}>
                    {crypto.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>{crypto.name}</h3>
                    <p className="text-xs text-white/45 leading-5">{crypto.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-10">
              <p className="badge badge-gold mb-4" style={{ display: "inline-flex" }}>RECOGNITION</p>
              <h2 className="text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>Trusted by Industry Leaders</h2>
              <p className="mt-2 text-white/45 text-sm">Published with explicit consent from verified enterprise clients.</p>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { quote: "Sentry Forensics provided deep wallet clustering analysis and cross-chain tracing that helped our team uncover indirect exposure we would have otherwise missed.", name: "Maria Keller", role: "Head of Financial Crime Compliance", company: "HSBC" },
              { quote: "During a ransomware investigation involving multi-chain transactions, Sentry Forensics allowed us to trace obfuscated flows across mixers and decentralized exchanges within hours.", name: "Daniel Wu", role: "Senior Incident Response Manager", company: "MicroPython" },
              { quote: "The real-time alerts and behavioral risk scoring improved our ability to proactively mitigate fraud risks before they impacted our ecosystem.", name: "Anika Patel", role: "Director of Global Risk Operations", company: "Visa" },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div className="glass-card rounded-2xl p-6 h-full">
                  <div className="testimonial-mark">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                      <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <p className="text-sm leading-6 text-white/70 mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/35">{t.role} · {t.company}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Logos */}
          <Reveal>
            <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--glass-border)" }}>
              <p className="text-xs text-white/25 text-center mb-5 tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>TRUSTED BY</p>
              <div className="flex flex-wrap justify-center gap-4">
                {[{ name: "HSBC", slug: "hsbc" }, { name: "Visa", slug: "visa" }, { name: "Coinbase", slug: "coinbase" }, { name: "Shell", slug: "shell" }, { name: "Razer", slug: "razer" }].map(({ name, slug }) => (
                  <div key={name} className="flex items-center justify-center rounded-xl px-6 py-4 hover-lift"
                    style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}>
                    <img src={`https://cdn.simpleicons.org/${slug}/ffffff`} alt={name} title={name} className="h-7 w-auto object-contain opacity-55 hover:opacity-90 transition-opacity"/>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── BANKING CTA ─────────────────────────── */}
      <section className="py-20" style={{ background: "var(--glass-1)", borderTop: "1px solid var(--glass-border)" }}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center"
              style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.07), rgba(253,211,77,0.03))", border: "1px solid rgba(245,158,11,0.15)" }}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)" }}/>
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(245,158,11,0.06), transparent 60%)", filter: "blur(40px)" }}/>
              </div>
              <div className="relative">
                <span className="badge badge-gold mx-auto mb-4" style={{ display: "inline-flex" }}>BANKING PORTAL</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  Recovery Complete?
                </h2>
                <p className="text-white/50 max-w-md mx-auto mb-8 text-sm leading-6">
                  Your recovered assets are waiting. Access Sentry&apos;s private banking portal to manage, transfer, and grow your recovered funds with enterprise-grade security.
                </p>
                <Link href="/banking" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#1a0f00", boxShadow: "0 8px 32px rgba(245,158,11,0.25)" }}>
                  Access Banking Portal
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}
