"use client";
import Link from "next/link";
import { useState } from "react";

export default function BankingLoginPage() {
  const [step, setStep] = useState<"login" | "verify">("login");
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState(["", "", "", "", "", ""]);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("verify"); }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 800px 600px at 20% 30%, rgba(0,212,255,0.07), transparent 60%), radial-gradient(ellipse 700px 500px at 80% 70%, rgba(157,111,255,0.07), transparent 60%)"
        }}/>
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}/>
        {/* Orbiting ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none animate-spin-slow"
          style={{ border: "1px solid rgba(0,212,255,0.04)" }}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ border: "1px solid rgba(245,158,11,0.04)", animation: "spin-slow 20s linear infinite reverse" }}/>
      </div>

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(253,211,77,0.08))", border: "1px solid rgba(245,158,11,0.25)", boxShadow: "0 0 40px rgba(245,158,11,0.12)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Sentry Banking
          </h1>
          <p className="text-sm text-white/45">Secure access to your recovered assets</p>
        </div>

        {step === "login" ? (
          <div className="animate-fade-in rounded-2xl p-6" style={{ background: "var(--glass-2)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-xl)" }}>
            <div className="mb-6">
              <p className="text-xs font-semibold text-white/40 mb-4 tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>SIGN IN</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Case ID / Email</label>
                  <input className="sf-input" placeholder="SF-2024-0847 or email@example.com" defaultValue="SF-2024-0847"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
                  <input type="password" className="sf-input" placeholder="••••••••" defaultValue="password"/>
                </div>
              </div>
            </div>

            <button onClick={handleLogin} disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={{ background: loading ? "var(--glass-2)" : "linear-gradient(135deg, #f59e0b, #fcd34d)", color: loading ? "var(--fg-tertiary)" : "#1a0f00" }}>
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--fg-tertiary)", borderTopColor: "transparent" }}/>
                  Authenticating...
                </>
              ) : "Sign In Securely"}
            </button>

            <div className="mt-4 flex items-center justify-between text-xs text-white/35">
              <button className="hover:text-white/60 transition-colors">Forgot password?</button>
              <Link href="/contact" className="hover:text-white/60 transition-colors">Need help?</Link>
            </div>

            <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--glass-border)" }}>
              <div className="flex items-center gap-2 justify-center text-[10px] text-white/25" style={{ fontFamily: "var(--font-mono)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                256-BIT ENCRYPTED · ZERO KNOWLEDGE
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in rounded-2xl p-6" style={{ background: "var(--glass-2)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-xl)" }}>
            <div className="text-center mb-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full mb-3"
                style={{ background: "var(--accent-emerald-dim)", border: "1px solid rgba(0,240,160,0.2)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Two-Factor Verification</p>
              <p className="text-xs text-white/40 mt-1">Enter the 6-digit code sent to +44•••••7823</p>
            </div>
            <div className="flex gap-2 justify-center mb-5">
              {pin.map((v, i) => (
                <input key={i} type="text" maxLength={1} value={v}
                  onChange={(e) => { const n = [...pin]; n[i] = e.target.value; setPin(n); }}
                  className="w-10 h-12 text-center text-lg font-bold rounded-lg outline-none transition-all"
                  style={{ background: v ? "rgba(0,212,255,0.1)" : "var(--glass-1)", border: v ? "1px solid rgba(0,212,255,0.3)" : "1px solid var(--glass-border)", color: "var(--fg-primary)", fontFamily: "var(--font-mono)" }}/>
              ))}
            </div>
            <Link href="/banking/dashboard">
              <button className="w-full py-3 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#1a0f00" }}>
                Verify & Enter Portal
              </button>
            </Link>
            <p className="text-center text-xs text-white/30 mt-3">
              Didn&apos;t receive code?{" "}
              <button className="text-white/55 hover:text-white transition-colors">Resend</button>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-white/25 mt-6">
          Not a client?{" "}
          <Link href="/recover-wallet" className="text-white/45 hover:text-white transition-colors">Start your recovery case →</Link>
        </p>
      </div>
    </div>
  );
}
