"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/Button";
import { getStoredUser } from "@/lib/api";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/docs", label: "Docs" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    setIsAdmin(user?.role === "admin");
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="glass-nav">
        <Container className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl"
              style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(157,111,255,0.15))", border: "1px solid rgba(0,212,255,0.2)" }}>
              <Image src="/emblem.svg" alt="Sentry Forensics" width={36} height={36}
                className="h-8 w-8 object-contain" priority />
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight text-white"
                style={{ fontFamily: "var(--font-display)" }}>
                Sentry Forensics
              </span>
              <span className="text-[9px] font-mono tracking-[0.18em] text-white/35 mt-px">
                DIGITAL ASSET RECOVERY
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className="px-3.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/6 transition-all duration-200 font-medium">
                {l.label}
              </Link>
            ))}
            <span className="mx-2 h-4 w-px bg-white/10" />
            <Link href="/banking"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{ color: "var(--gold-300)", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Banking Portal
            </Link>
            {isAdmin && (
              <Link href="/admin"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ color: "var(--accent-teal)", background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.15)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Admin Portal
              </Link>
            )}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <ButtonLink href="/recover-wallet" variant="secondary" className="hidden sm:inline-flex">
              Start intake
            </ButtonLink>
            <ButtonLink href="/recover-wallet" variant="primary">
              <span className="hidden sm:inline">Secure</span> Intake
            </ButtonLink>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/6 transition-all md:hidden">
              {mobileOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
              )}
            </button>
          </div>
        </Container>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t md:hidden" style={{ borderColor: "var(--glass-border)", background: "rgba(4,6,13,0.96)", backdropFilter: "blur(24px)" }}>
            <Container className="py-4 flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all font-medium">
                  {l.label}
                </Link>
              ))}
              <div className="my-2 h-px" style={{ background: "var(--glass-border)" }} />
              <Link href="/banking" onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
                style={{ color: "var(--gold-300)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Banking Portal
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{ color: "var(--accent-teal)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Admin Portal
                </Link>
              )}
            </Container>
          </div>
        )}
      </div>
    </header>
  );
}
