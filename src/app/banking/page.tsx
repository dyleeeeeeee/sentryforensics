"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, saveSession, getStoredUser } from "@/lib/api";

export default function BankingLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      router.push(user.role === "admin" ? "/admin" : "/banking/dashboard");
    }
  }, [router]);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) { setError("Enter your Case ID or email and password."); return; }
    setLoading(true);
    setError("");
    try {
      const result = await login(identifier, password);
      saveSession(result.token, result.user);
      router.push(result.user.role === "admin" ? "/admin" : "/banking/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none animate-spin-slow"
          style={{ border: "1px solid rgba(0,212,255,0.04)" }}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ border: "1px solid rgba(245,158,11,0.04)", animation: "spin-slow 20s linear infinite reverse" }}/>
      </div>

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(253,211,77,0.08))", border: "1px solid rgba(245,158,11,0.25)", boxShadow: "0 0 40px rgba(245,158,11,0.12)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Sentry Portal
          </h1>
          <p className="text-sm text-white/45">Secure access to your case and recovered assets</p>
        </div>

        <div className="animate-fade-in rounded-2xl p-4 sm:p-6" style={{ background: "var(--glass-2)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-xl)" }}>
          <p className="text-xs font-semibold text-white/40 mb-4 tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>SIGN IN</p>
          <div className="space-y-3 mb-6">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Case ID or Email</label>
              <input className="sf-input" placeholder="SF-XXXX-XXXX or email@example.com"
                value={identifier} onChange={e => setIdentifier(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}/>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
              <input type="password" className="sf-input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}/>
            </div>
          </div>

          {error && <p className="mb-3 text-xs text-red-400 text-center">{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
            style={{ background: loading ? "var(--glass-2)" : "linear-gradient(135deg, #f59e0b, #fcd34d)", color: loading ? "var(--fg-tertiary)" : "#1a0f00" }}>
            {loading ? (
              <><span className="h-4 w-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--fg-tertiary)", borderTopColor: "transparent" }}/>Signing in...</>
            ) : "Sign In"}
          </button>

          <div className="mt-4 flex items-center justify-end text-xs text-white/35">
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

        <p className="text-center text-xs text-white/25 mt-6">
          Not a client?{" "}
          <Link href="/recover-wallet" className="text-white/45 hover:text-white transition-colors">Submit an intake →</Link>
        </p>
      </div>
    </div>
  );
}
