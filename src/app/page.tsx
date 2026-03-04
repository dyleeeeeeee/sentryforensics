"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export default function Page() {

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".scroll-animate"));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).classList.add("visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function Reveal({ children }: { children: ReactNode; delayMs?: number; className?: string }) {
    const { delayMs, className } = arguments[0] as {
      children: ReactNode;
      delayMs?: number;
      className?: string;
    };

    if (delayMs == null && !className) return <>{children}</>;

    return (
      <div className={className} style={delayMs != null ? { transitionDelay: `${delayMs}ms` } : undefined}>
        {children}
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <section className="pt-16 sm:pt-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl animate-fade-in">
                Recover Your Lost Cryptocurrency
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-white/75 sm:text-lg animate-fade-in-delay">
                Our advanced technology and expert team help you recover lost or stolen cryptocurrency from wallets, exchanges, and scam operations.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center animate-slide-up">
                <a
                  href="/recover-wallet"
                  className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium bg-white/15 text-white border border-white/20 hover:bg-white/20 transition hover-lift"
                >
                  Start Recovery
                </a>
                <a
                  href="/process"
                  className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium text-white/90 hover:bg-white/10 border border-transparent transition hover-lift"
                >
                  How It Works
                </a>
              </div>

              <p className="mt-6 text-xs leading-5 text-white/55 animate-fade-in-delay">
                No recovery, no fee. We never ask for seed phrases or private keys.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 sm:p-8 animate-slide-in-right">
              <h2 className="text-lg font-semibold text-white">
                Why Choose Our Recovery Service?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                We combine cutting-edge blockchain technology with expert recovery specialists to maximize your chances of recovery.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 hover-scale">
                  <p className="text-sm font-medium text-white">No Upfront Costs</p>
                  <p className="mt-1 text-sm text-white/70">You only pay when we successfully recover your assets. No recovery, no fee.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 hover-scale">
                  <p className="text-sm font-medium text-white">Fast Recovery</p>
                  <p className="mt-1 text-sm text-white/70">Our advanced algorithms work quickly to trace and recover your digital assets.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 hover-scale">
                  <p className="text-sm font-medium text-white">Secure Process</p>
                  <p className="mt-1 text-sm text-white/70">End-to-end encryption and secure protocols protect your information.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 hover-scale">
                  <p className="text-sm font-medium text-white">24/7 Support</p>
                  <p className="mt-1 text-sm text-white/70">Our team is available around the clock to assist with your recovery needs.</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 hover-glow">
                <p className="text-sm font-medium text-white">
                  We Recover All Types of Crypto
                </p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Bitcoin, Ethereum, and other major assets from wallets, exchanges, and scams.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="glass-card rounded-3xl p-6 animate-slide-up animate-stagger-1">
              <p className="text-sm font-semibold text-white">Initial Consultation</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                We analyze your case and determine the best recovery approach for your specific situation.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-6 animate-slide-up animate-stagger-2">
              <p className="text-sm font-semibold text-white">Technical Analysis</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Our experts perform a deep technical analysis to locate your assets and develop a recovery strategy.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-6 animate-slide-up animate-stagger-3">
              <p className="text-sm font-semibold text-white">Recovery & Return</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                We execute the recovery plan and securely return your assets to your control.
              </p>
            </div>
          </div>

          <section className="mt-12 scroll-animate">
            <Reveal>
              <div className="glass-card rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Why Choose Our Recovery Service?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                We combine cutting-edge blockchain technology with expert recovery specialists to maximize your chances of recovery.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Reveal delayMs={80} className="contents">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 hover-scale animate-stagger-1">
                  <p className="text-sm font-medium text-white">No Upfront Costs</p>
                  <p className="mt-1 text-sm text-white/70">You only pay when we successfully recover your assets. No recovery, no fee.</p>
                  </div>
                </Reveal>
                <Reveal delayMs={140} className="contents">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 hover-scale animate-stagger-2">
                  <p className="text-sm font-medium text-white">Fast Recovery</p>
                  <p className="mt-1 text-sm text-white/70">Our advanced algorithms work quickly to trace and recover your digital assets.</p>
                  </div>
                </Reveal>
                <Reveal delayMs={200} className="contents">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 hover-scale animate-stagger-3">
                  <p className="text-sm font-medium text-white">Secure Process</p>
                  <p className="mt-1 text-sm text-white/70">End-to-end encryption and secure protocols protect your information.</p>
                  </div>
                </Reveal>
                <Reveal delayMs={260} className="contents">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 hover-scale animate-stagger-4">
                  <p className="text-sm font-medium text-white">24/7 Support</p>
                  <p className="mt-1 text-sm text-white/70">Our team is available around the clock to assist with your recovery needs.</p>
                  </div>
                </Reveal>
              </div>
              </div>
            </Reveal>
          </section>

          <section className="mt-12 scroll-animate">
            <Reveal>
              <div className="glass-card rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Our Recovery Success Rate
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                We've helped thousands of clients recover their crypto assets with our industry-leading success rate.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Reveal delayMs={80} className="contents">
                  <div className="glass-card rounded-2xl p-6 text-center hover-scale animate-stagger-1">
                    <p className="text-3xl font-bold text-white animate-pulse">98%</p>
                    <p className="mt-2 text-sm text-white/70">Success Rate</p>
                  </div>
                </Reveal>
                <Reveal delayMs={140} className="contents">
                  <div className="glass-card rounded-2xl p-6 text-center hover-scale animate-stagger-2">
                    <p className="text-3xl font-bold text-white">$2.5M+</p>
                    <p className="mt-2 text-sm text-white/70">Assets Recovered</p>
                  </div>
                </Reveal>
                <Reveal delayMs={200} className="contents">
                  <div className="glass-card rounded-2xl p-6 text-center hover-scale animate-stagger-3">
                    <p className="text-3xl font-bold text-white">1,200+</p>
                    <p className="mt-2 text-sm text-white/70">Happy Clients</p>
                  </div>
                </Reveal>
              </div>
              </div>
            </Reveal>
          </section>

          <section className="mt-12 scroll-animate">
            <Reveal>
              <div className="glass-card rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                We Recover All Types of Crypto
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Our specialized team can help recover assets from a wide range of wallets and platforms.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Reveal delayMs={80} className="contents">
                  <div className="glass-card rounded-2xl p-5 hover-lift animate-stagger-1">
                  <p className="text-sm font-semibold text-white">Wallet Recovery</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Lost access to your crypto wallet? Our specialized tools can help recover your assets from most popular wallet types.
                  </p>
                  </div>
                </Reveal>
                <Reveal delayMs={120} className="contents">
                  <div className="glass-card rounded-2xl p-5 hover-lift animate-stagger-2">
                  <p className="text-sm font-semibold text-white">Bitcoin</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Recover BTC from corrupted wallets, forgotten passphrases, and more.
                  </p>
                  </div>
                </Reveal>
                <Reveal delayMs={160} className="contents">
                  <div className="glass-card rounded-2xl p-5 hover-lift animate-stagger-3">
                  <p className="text-sm font-semibold text-white">Ethereum</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Recover ETH, NFTs, DeFi assets, and tokens from the Ethereum blockchain.
                  </p>
                  </div>
                </Reveal>
                <Reveal delayMs={200} className="contents">
                  <div className="glass-card rounded-2xl p-5 hover-lift animate-stagger-4">
                  <p className="text-sm font-semibold text-white">Hardware Wallets</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Specialized recovery for Ledger, Trezor and other hardware wallet issues.
                  </p>
                  </div>
                </Reveal>
                <Reveal delayMs={240} className="contents">
                  <div className="glass-card rounded-2xl p-5 hover-lift animate-stagger-5">
                  <p className="text-sm font-semibold text-white">Seed Phrases</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Recover from partial or corrupted seed phrases and mnemonic keys.
                  </p>
                  </div>
                </Reveal>
                <Reveal delayMs={280} className="contents">
                  <div className="glass-card rounded-2xl p-5 hover-lift animate-stagger-6">
                  <p className="text-sm font-semibold text-white">Exchange Accounts</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Assistance with compromised exchange accounts and unauthorized transfers.
                  </p>
                  </div>
                </Reveal>
              </div>
              </div>
            </Reveal>
          </section>

          <section className="mt-12 scroll-animate">
            <Reveal>
            <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Industry Recognition
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                  Trusted by thousands of clients worldwide for crypto recovery services.
                </p>
              </div>
            </div>

             <div className="mt-5 grid gap-4 md:grid-cols-3">
               <Reveal delayMs={80} className="contents">
                 <div className="glass-card rounded-3xl p-6">
                   <div className="testimonial-mark" aria-hidden="true">
                     <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                       <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                     </svg>
                   </div>
                   <p className="text-sm leading-6 text-white/80">
                     "Sentry Forensics provided deep wallet clustering analysis and cross-chain tracing that helped our team uncover indirect exposure we would have otherwise missed. The platform's attribution intelligence significantly reduced our investigation time and strengthened our SAR reporting process."
                   </p>
                   <p className="mt-4 text-xs font-medium text-white/90">Maria Keller</p>
                   <p className="text-xs text-white/50">Head of Financial Crime Compliance · HSBC</p>
                 </div>
               </Reveal>

               <Reveal delayMs={140} className="contents">
                 <div className="glass-card rounded-3xl p-6">
                   <div className="testimonial-mark" aria-hidden="true">
                     <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                       <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                     </svg>
                   </div>
                   <p className="text-sm leading-6 text-white/80">
                     "During a ransomware investigation involving multi-chain transactions, Sentry Forensics allowed us to trace obfuscated flows across mixers and decentralized exchanges. Within hours, we identified associated wallet clusters and provided actionable intelligence to law enforcement partners."
                   </p>
                   <p className="mt-4 text-xs font-medium text-white/90">Daniel Wu</p>
                   <p className="text-xs text-white/50">Senior Incident Response Manager · MicroPython</p>
                 </div>
               </Reveal>

               <Reveal delayMs={200} className="contents">
                 <div className="glass-card rounded-3xl p-6">
                   <div className="testimonial-mark" aria-hidden="true">
                     <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                       <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                     </svg>
                   </div>
                   <p className="text-sm leading-6 text-white/80">
                     "As digital assets increasingly intersect with traditional payment rails, our exposure monitoring requirements have expanded. The real-time alerts and behavioral risk scoring improved our ability to proactively mitigate fraud risks before they impacted our ecosystem."
                   </p>
                   <p className="mt-4 text-xs font-medium text-white/90">Anika Patel</p>
                   <p className="text-xs text-white/50">Director of Global Risk Operations · Visa</p>
                 </div>
               </Reveal>
             </div>

            {/* <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="glass-card rounded-3xl p-6">
                <div className="testimonial-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                  </svg>
                </div>
                <p className="text-sm leading-6 text-white/80">
                  “I thought my Bitcoin was gone forever after a phishing attack. Sentry Forensics traced it and helped me recover 85% of my funds.”
                </p>
                <p className="mt-4 text-xs font-medium text-white/90">John D.</p>
                <p className="text-xs text-white/50">Bitcoin Investor</p>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="testimonial-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                  </svg>
                </div>
                <p className="text-sm leading-6 text-white/80">
                  “Fast, secure, and they never asked for my private keys. Recovered funds from a scam I thought was hopeless.”
                </p>
                <p className="mt-4 text-xs font-medium text-white/90">Mike R.</p>
                <p className="text-xs text-white/50">DeFi User</p>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="testimonial-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                  </svg>
                </div>
                <p className="text-sm leading-6 text-white/80">
                  “Sentry Forensics provided cross-border transaction tracing that connected seemingly unrelated wallets. The investigative dashboard streamlined collaboration between our fraud and legal teams, enabling us to build a strong evidentiary case.”
                </p>
                <p className="mt-4 text-xs font-medium text-white/90">Sophie Laurent</p>
                <p className="text-xs text-white/50">Global Fraud Intelligence Lead · Razer</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="glass-card rounded-3xl p-6">
                <div className="testimonial-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                  </svg>
                </div>
                <p className="text-sm leading-6 text-white/80">
                  “The granularity of Sentinel's entity attribution database allowed us to move from raw blockchain data to actionable intelligence almost immediately — reducing financial exposure and improving our user protection protocols.”
                </p>
                <p className="mt-4 text-xs font-medium text-white/90">Lucas Moretti</p>
                <p className="text-xs text-white/50">Head of Security Operations · Coinbase</p>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="testimonial-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                  </svg>
                </div>
                <p className="text-sm leading-6 text-white/80">
                  “Sentry Forensics enabled forensic tracing and source-of-funds validation that added transparency to our review process. The platform's reporting outputs were audit-ready and defensible, significantly strengthening our governance posture.”
                </p>
                <p className="mt-4 text-xs font-medium text-white/90">James O'Connor</p>
                <p className="text-xs text-white/50">VP, Internal Audit · Shell</p>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="testimonial-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                  </svg>
                </div>
                <p className="text-sm leading-6 text-white/80">
                  “As part of an internal audit involving third parties in high-risk jurisdictions, source-of-funds validation added transparency. The reporting outputs were audit-ready and defensible, strengthening governance posture.”
                </p>
                <p className="mt-4 text-xs font-medium text-white/90">Anika Patel</p>
                <p className="text-xs text-white/50">Director of Global Risk Operations · Visa</p>
              </div>
            </div>

             */}

             <div className="mt-4 grid gap-4 md:grid-cols-3">
               <Reveal delayMs={80} className="contents">
                 <div className="glass-card rounded-3xl p-6">
                   <div className="testimonial-mark" aria-hidden="true">
                     <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                       <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9 V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                     </svg>
                   </div>
                   <p className="text-sm leading-6 text-white/80">
                     "The granularity of Sentinel's entity attribution database allowed us to move from raw blockchain data to actionable intelligence almost immediately — reducing financial exposure and improving our user protection protocols."
                   </p>
                   <p className="mt-4 text-xs font-medium text-white/90">Lucas Moretti</p>
                   <p className="text-xs text-white/50">Head of Security Operations · Coinbase</p>
                 </div>
               </Reveal>

               <Reveal delayMs={140} className="contents">
                 <div className="glass-card rounded-3xl p-6">
                   <div className="testimonial-mark" aria-hidden="true">
                     <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                       <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9 V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                     </svg>
                   </div>
                   <p className="text-sm leading-6 text-white/80">
                     "Sentry Forensics provided cross-border transaction tracing that connected seemingly unrelated wallets. The investigative dashboard streamlined collaboration between our fraud and legal teams, enabling us to build a strong evidentiary case."
                   </p>
                   <p className="mt-4 text-xs font-medium text-white/90">Sophie Laurent</p>
                   <p className="text-xs text-white/50">Global Fraud Intelligence Lead · Razer</p>
                 </div>
               </Reveal>

               <Reveal delayMs={200} className="contents">
                 <div className="glass-card rounded-3xl p-6">
                   <div className="testimonial-mark" aria-hidden="true">
                     <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                       <path d="M9.2 6.5c-2.2 1.4-3.5 3.5-3.8 6.3h4.3v4.7H4.9 V13c0-3.9 1.7-6.9 5-9l-.7 2.5Zm10 0c-2.2 1.4-3.5 3.5-3.8 6.3H20v4.7h-4.8V13c0-3.9 1.7-6.9 5-9l-.8 2.5Z" fill="currentColor" opacity="0.85" />
                     </svg>
                   </div>
                   <p className="text-sm leading-6 text-white/80">
                     "Sentry Forensics enabled forensic tracing and source-of-funds validation that added transparency to our review process. The platform's reporting outputs were audit-ready and defensible, significantly strengthening our governance posture."
                   </p>
                   <p className="mt-4 text-xs font-medium text-white/90">James O'Connor</p>
                   <p className="text-xs text-white/50">VP, Internal Audit · Shell</p>
                 </div>
               </Reveal>
             </div>

            {/* <p className="text-xs font-medium text-white/60">Trusted by</p> */} 
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Trusted By
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                  Published with explicit consent from verified enterprise clients across banking, technology, payments, and beyond.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-6">
              {[
                { name: "HSBC", slug: "hsbc" },
                { name: "MicroPython", slug: "micropython" },
                { name: "Visa", slug: "visa" },
                { name: "Coinbase", slug: "coinbase" },
                { name: "Razer", slug: "razer" },
                { name: "Shell", slug: "shell" },
              ].map(({ name, slug }) => (
                <div
                  key={name}
                  className="flex items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-4 py-5"
                >
                  <img
                    src={`https://cdn.simpleicons.org/${slug}/ffffff`}
                    alt={name}
                    title={name}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
            </div>
            </Reveal>
          </section>

          {/* <section className="mt-12">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Trust center
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Our operating model is intentionally conservative: evidence-led, privacy-aware, and designed to reduce user risk through strict intake boundaries.
                </p>
              </div>

              <div className="grid gap-4 lg:col-span-2 md:grid-cols-2">
                <div className="glass-card rounded-3xl p-6">
                  <p className="text-sm font-semibold text-white">Non-custodial by design</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Sentry Forensics does not take custody of funds. We focus on assessment, documentation, and safe operational next steps.
                  </p>
                </div>

                <div className="glass-card rounded-3xl p-6">
                  <p className="text-sm font-semibold text-white">No secret collection</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    We never ask for seed phrases, private keys, wallet backup files, or remote access.
                  </p>
                </div>

                <div className="glass-card rounded-3xl p-6">
                  <p className="text-sm font-semibold text-white">Evidence-led intake</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    We rely on public identifiers (addresses and transaction hashes), plus a structured timeline and narrative.
                  </p>
                </div>

                <div className="glass-card rounded-3xl p-6">
                  <p className="text-sm font-semibold text-white">Transparent limitations</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    We avoid guaranteed claims. Outcomes vary by scenario, timing, and evidence.
                  </p>
                </div>
              </div>
            </div>
          </section> */}

          {/* <section className="mt-12">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Our Recovery Process
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                  We follow a structured approach to maximize your chances of recovering your crypto assets.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="glass-card rounded-3xl p-6">
                <p className="text-sm font-semibold text-white">Initial Consultation</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  We analyze your case and determine the best recovery approach for your specific situation.
                </p>
              </div>
              <div className="glass-card rounded-3xl p-6">
                <p className="text-sm font-semibold text-white">Technical Analysis</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Our experts perform a deep technical analysis to locate your assets and develop a recovery strategy.
                </p>
              </div>
              <div className="glass-card rounded-3xl p-6">
                <p className="text-sm font-semibold text-white">Recovery & Return</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  We execute the recovery plan and securely return your assets to your control.
                </p>
              </div>
            </div>
          </section> */}

          <footer className="py-14 text-center">
            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} Sentry Forensics
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
 }
