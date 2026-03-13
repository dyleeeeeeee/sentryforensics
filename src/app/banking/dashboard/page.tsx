"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getDashboard, type DashboardData, type Asset, type Transaction } from "@/lib/api";

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1400;
    const steps = 60;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);
  return <>{prefix}{display.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);

  useEffect(() => {
    getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="h-8 w-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--accent-teal)", borderTopColor: "transparent" }}/>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-white/40 py-16">Failed to load dashboard.</div>;
  }

  const { user, totalUsd: total, recoveredUsd, recoveryRate, recoveryComplete, assets, recentTransactions } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>GOOD MORNING</p>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{user.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/banking/transfer" className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#1a0f00" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            Transfer
          </Link>
          <Link href="/banking/accounts" className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 hover:-translate-y-px"
            style={{ background: "var(--glass-2)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)" }}>
            Accounts
          </Link>
        </div>
      </div>

      {/* Total Balance Hero */}
      <div className="rounded-2xl p-6 sm:p-8 relative overflow-hidden animate-fade-in"
        style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(157,111,255,0.06))", border: "1px solid rgba(0,212,255,0.18)", boxShadow: "0 0 60px rgba(0,212,255,0.06)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)" }}/>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs text-white/40 tracking-widest mb-3" style={{ fontFamily: "var(--font-mono)" }}>TOTAL PORTFOLIO VALUE</p>
            <div className="text-4xl sm:text-5xl font-extrabold mb-2"
              style={{ fontFamily: "var(--font-display)", background: "linear-gradient(135deg, #ffffff 30%, rgba(255,255,255,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              $<AnimatedNumber value={total} decimals={2}/>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-success">↑ +${recoveredUsd.toLocaleString()} RECOVERED</span>
              <span className="text-xs text-white/35">All time</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-right">
            <div>
              <p className="text-xs text-white/35 mb-1" style={{ fontFamily: "var(--font-mono)" }}>RECOVERY RATE</p>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--accent-emerald)" }}>{recoveryRate}%</p>
            </div>
            <div>
              <p className="text-xs text-white/35 mb-1" style={{ fontFamily: "var(--font-mono)" }}>CASE #</p>
              <p className="text-base font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>{user.caseId}</p>
            </div>
          </div>
        </div>

        {/* Mini allocation bar */}
        <div className="mt-6">
          <div className="flex rounded-full overflow-hidden h-2 gap-0.5">
            {assets.map((a) => (
              <div key={a.symbol} className="transition-all duration-300 rounded-full cursor-pointer"
                style={{ flex: a.usd / total, background: a.color, opacity: hoveredAsset && hoveredAsset !== a.symbol ? 0.3 : 1 }}
                onMouseEnter={() => setHoveredAsset(a.symbol)}
                onMouseLeave={() => setHoveredAsset(null)}/>
            ))}
          </div>
          <div className="flex gap-4 mt-2.5 flex-wrap">
            {assets.map((a) => (
              <div key={a.symbol} className="flex items-center gap-1.5 cursor-pointer transition-opacity"
                style={{ opacity: hoveredAsset && hoveredAsset !== a.symbol ? 0.35 : 1 }}
                onMouseEnter={() => setHoveredAsset(a.symbol)}
                onMouseLeave={() => setHoveredAsset(null)}>
                <span className="h-2 w-2 rounded-full" style={{ background: a.color }}/>
                <span className="text-xs text-white/50" style={{ fontFamily: "var(--font-mono)" }}>{a.symbol}</span>
                <span className="text-xs text-white/30">{((a.usd / total) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assets grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {assets.map((asset, i) => (
          <div key={asset.symbol} className={`glass-card rounded-2xl p-4 animate-fade-in delay-${i + 1} hover-lift cursor-default`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: `${asset.color}18`, border: `1px solid ${asset.color}28`, color: asset.color, fontFamily: "var(--font-mono)" }}>
                  {asset.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{asset.symbol}</p>
                  <p className="text-[11px] text-white/35">{asset.name}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold ${asset.change >= 0 ? "text-green-400" : "text-red-400"}`}
                style={{ fontFamily: "var(--font-mono)" }}>
                {asset.change >= 0 ? "+" : ""}{asset.change}%
              </span>
            </div>
            <p className="text-xl font-extrabold text-white mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
              {asset.symbol === "USDC" ? `$${asset.amount.toLocaleString()}` : `${asset.amount} ${asset.symbol}`}
            </p>
            <p className="text-sm text-white/40">${asset.usd.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Quick actions + Recent TX */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-white/70 tracking-wide">Quick Actions</h2>
          {[
            { label: "Transfer Funds", desc: "Move to bank or wallet", href: "/banking/transfer", color: "var(--gold-400)", icon: "→" },
            { label: "View Recovery Status", desc: `Case ${user.caseId}`, href: "/banking/recovery-status", color: "var(--accent-emerald)", icon: "✓" },
            { label: "Manage Cards", desc: "Virtual debit cards", href: "/banking/cards", color: "var(--accent-violet)", icon: "▪" },
            { label: "Download Statement", desc: "Export PDF report", href: "#", color: "var(--accent-teal)", icon: "↓" },
          ].map((action) => (
            <Link key={action.label} href={action.href} className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--glass-2)"; e.currentTarget.style.borderColor = "var(--glass-border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--glass-1)"; e.currentTarget.style.borderColor = "var(--glass-border)"; }}>
              <span className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: `${action.color}14`, color: action.color, fontFamily: "var(--font-mono)" }}>
                {action.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{action.label}</p>
                <p className="text-xs text-white/35 truncate">{action.desc}</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="ml-auto text-white/20 flex-shrink-0">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
            <Link href="/banking/transactions" className="text-xs hover:text-white/70 transition-colors" style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)" }}>
              VIEW ALL →
            </Link>
          </div>
          <div className="space-y-1">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-default"
                style={{ borderRadius: "12px" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--glass-1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <span className="h-8 w-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{
                    background: tx.dir === "in" ? "rgba(0,240,160,0.1)" : "rgba(255,68,102,0.1)",
                    color: tx.dir === "in" ? "var(--accent-emerald)" : "#ff6680",
                    border: `1px solid ${tx.dir === "in" ? "rgba(0,240,160,0.2)" : "rgba(255,68,102,0.2)"}`,
                    fontFamily: "var(--font-mono)",
                    fontSize: "16px",
                  }}>
                  {tx.dir === "in" ? "↓" : "↑"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{tx.type}</p>
                  <p className="text-[11px] text-white/35">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-mono)", color: tx.dir === "in" ? "var(--accent-emerald)" : "#ff6680" }}>
                    {tx.amount}
                  </p>
                  <p className="text-[11px] text-white/35">{tx.usd}</p>
                </div>
                <span className={`badge flex-shrink-0 ${tx.status === "complete" ? "badge-success" : "badge-warning"}`}
                  style={{ fontSize: "9px" }}>
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recovery summary banner */}
      <div className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: "linear-gradient(135deg, rgba(0,240,160,0.06), rgba(0,212,255,0.04))", border: "1px solid rgba(0,240,160,0.12)" }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent-emerald-dim)", border: "1px solid rgba(0,240,160,0.2)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Recovery Complete — Case #{user.caseId}</p>
            <p className="text-xs text-white/45 mt-0.5">All recovered assets have been credited to your portal. Forensic report available for download.</p>
          </div>
        </div>
        <div className="flex gap-2 sm:ml-auto flex-shrink-0">
          <Link href="/banking/recovery-status" className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "var(--accent-emerald-dim)", color: "var(--accent-emerald)", border: "1px solid rgba(0,240,160,0.2)" }}>
            View Report
          </Link>
        </div>
      </div>
    </div>
  );
}
