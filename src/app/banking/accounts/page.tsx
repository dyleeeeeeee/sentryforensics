"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getAccounts, type AccountData, type LinkedBank } from "@/lib/api";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [linkedBanks, setLinkedBanks] = useState<LinkedBank[]>([]);
  const [activeAcct, setActiveAcct] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccounts().then(d => {
      setAccounts(d.accounts);
      setLinkedBanks(d.linkedBanks);
      if (d.accounts.length > 0) setActiveAcct(d.accounts[0].id);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="h-8 w-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--accent-teal)", borderTopColor: "transparent" }}/>
    </div>
  );

  const selected = accounts.find(a => a.id === activeAcct) ?? accounts[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>BANKING PORTAL</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Accounts</h1>
      </div>

      {accounts.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center text-white/30 text-sm">
          No accounts assigned to your account yet.
        </div>
      )}

      {/* Account cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {accounts.map(acct => (
          <button key={acct.id} onClick={() => setActiveAcct(acct.id)}
            className="text-left p-5 rounded-2xl transition-all hover:-translate-y-0.5"
            style={{
              background: activeAcct === acct.id ? "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(157,111,255,0.05))" : "var(--glass-2)",
              border: `1px solid ${activeAcct === acct.id ? "rgba(0,212,255,0.2)" : "var(--glass-border)"}`,
              boxShadow: activeAcct === acct.id ? "var(--shadow-lg)" : "none",
            }}>
            {activeAcct === acct.id && (
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)" }}/>
            )}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-base font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{acct.name}</p>
                <p className="text-xs text-white/35 mt-0.5">{acct.type}</p>
              </div>
              <span className="badge badge-success" style={{ fontSize: "9px" }}>{acct.status}</span>
            </div>
            <p className="text-2xl font-extrabold mb-1" style={{ fontFamily: "var(--font-display)", color: activeAcct === acct.id ? "var(--accent-teal)" : "var(--fg-primary)" }}>
              ${acct.balance.toLocaleString()}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {acct.assets.map(a => (
                <span key={a.symbol} className="text-[10px] px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-mono)", background: `${a.color}14`, color: a.color, border: `1px solid ${a.color}22` }}>
                  {a.amount} {a.symbol}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Selected account detail */}
      {selected && <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--glass-border)" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">{selected.name} — Asset Breakdown</h2>
            <Link href="/banking/transfer" className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--glass-2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--glass-1)")}>
              Transfer →
            </Link>
          </div>
        </div>
        <div className="p-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {selected.assets.map(asset => (
            <div key={asset.symbol} className="p-4 rounded-xl" style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: `${asset.color}18`, color: asset.color, fontFamily: "var(--font-mono)" }}>
                  {asset.symbol.slice(0, 2)}
                </span>
                <span className="text-[10px] text-white/30" style={{ fontFamily: "var(--font-mono)" }}>
                  {((asset.usd / selected.balance) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-lg font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>
                {asset.amount.toLocaleString()} <span className="text-sm" style={{ color: asset.color }}>{asset.symbol}</span>
              </p>
              <p className="text-sm text-white/40 mt-0.5">${asset.usd.toLocaleString()}</p>
              <div className="mt-3 progress-bar">
                <div className="progress-fill" style={{ width: `${(asset.usd / selected.balance) * 100}%`, background: `linear-gradient(90deg, ${asset.color}, ${asset.color}88)` }}/>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
          {[["Case #", selected.case], ["Opened", selected.opened], ["Status", "Active"], ["Type", selected.type]].map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] text-white/30 tracking-wide mb-1" style={{ fontFamily: "var(--font-mono)" }}>{k}</p>
              <p className="text-sm font-semibold text-white">{v}</p>
            </div>
          ))}
        </div>
      </div>}

      {/* Linked banks */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--glass-border)" }}>
          <h2 className="font-semibold text-white">Linked Bank Accounts</h2>
          <button className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: "var(--accent-teal-dim)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--accent-teal)", fontFamily: "var(--font-mono)" }}>
            + ADD BANK
          </button>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--glass-border)" }}>
          {linkedBanks.map(bank => (
            <div key={bank.id} className="flex items-center gap-4 px-6 py-4">
              <span className="text-2xl">{bank.country}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{bank.name}</p>
                <p className="text-xs text-white/35" style={{ fontFamily: "var(--font-mono)" }}>{bank.type} · {bank.number}</p>
              </div>
              {bank.verified && <span className="badge badge-success" style={{ fontSize: "9px" }}>Verified</span>}
              <button className="text-xs text-white/30 hover:text-white/60 transition-colors">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
