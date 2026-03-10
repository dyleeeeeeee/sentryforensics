"use client";
import { useState } from "react";

const ALL_TX = [
  { id: "t001", type: "Recovery Credit", asset: "BTC", amount: "+3.42 BTC", usd: 207842, date: "Mar 8, 2026", status: "complete", category: "recovery", dir: "in" },
  { id: "t002", type: "Recovery Credit", asset: "ETH", amount: "+15.8 ETH", usd: 47556, date: "Mar 8, 2026", status: "complete", category: "recovery", dir: "in" },
  { id: "t003", type: "Recovery Credit", asset: "USDC", amount: "+28,420 USDC", usd: 28420, date: "Mar 8, 2026", status: "complete", category: "recovery", dir: "in" },
  { id: "t004", type: "Recovery Credit", asset: "SOL", amount: "+92.4 SOL", usd: 11982, date: "Mar 8, 2026", status: "complete", category: "recovery", dir: "in" },
  { id: "t005", type: "Forensics Service Fee", asset: "USD", amount: "-$12,400", usd: -12400, date: "Mar 9, 2026", status: "complete", category: "fee", dir: "out" },
  { id: "t006", type: "Yield Interest", asset: "USDC", amount: "+142 USDC", usd: 142, date: "Mar 10, 2026", status: "pending", category: "yield", dir: "in" },
  { id: "t007", type: "Withdrawal Request", asset: "USDC", amount: "-5,000 USDC", usd: -5000, date: "Mar 10, 2026", status: "processing", category: "transfer", dir: "out" },
  { id: "t008", type: "Conversion BTC→USDC", asset: "BTC", amount: "-0.1 BTC", usd: -6080, date: "Mar 9, 2026", status: "complete", category: "exchange", dir: "out" },
  { id: "t009", type: "Conversion BTC→USDC", asset: "USDC", amount: "+6,050 USDC", usd: 6050, date: "Mar 9, 2026", status: "complete", category: "exchange", dir: "in" },
];

const FILTERS = ["All", "Recovery", "Transfer", "Yield", "Fee", "Exchange"];

const statusStyle: Record<string, string> = {
  complete: "badge-success",
  pending: "badge-warning",
  processing: "badge-teal",
  failed: "badge-danger",
};

export default function TransactionsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ALL_TX.filter(tx => {
    const matchFilter = filter === "All" || tx.category.toLowerCase() === filter.toLowerCase();
    const matchSearch = !search || tx.type.toLowerCase().includes(search.toLowerCase()) || tx.asset.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>BANKING PORTAL</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Transactions</h1>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Credited", value: "$295,800", color: "var(--accent-emerald)" },
          { label: "Total Debited", value: "$17,400", color: "#ff6680" },
          { label: "Pending", value: "$5,142", color: "var(--gold-300)" },
          { label: "Net Balance", value: "$278,400", color: "var(--accent-teal)" },
        ].map(item => (
          <div key={item.label} className="glass-card rounded-xl p-4">
            <p className="text-[10px] text-white/35 mb-1.5 tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>{item.label}</p>
            <p className="text-lg font-extrabold" style={{ fontFamily: "var(--font-display)", color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input className="sf-input pl-10" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === f ? "var(--accent-teal-dim)" : "var(--glass-1)",
                border: `1px solid ${filter === f ? "rgba(0,212,255,0.25)" : "var(--glass-border)"}`,
                color: filter === f ? "var(--accent-teal)" : "var(--fg-secondary)",
                fontFamily: "var(--font-mono)",
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b" style={{ borderColor: "var(--glass-border)" }}>
          {["TRANSACTION", "ASSET", "AMOUNT (USD)", "STATUS"].map(h => (
            <p key={h} className="text-[10px] font-semibold text-white/25 tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>{h}</p>
          ))}
        </div>
        <div className="divide-y" style={{ borderColor: "var(--glass-border)" }}>
          {filtered.map(tx => (
            <div key={tx.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 transition-all cursor-default"
              onMouseEnter={e => { e.currentTarget.style.background = "var(--glass-1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{tx.type}</p>
                <p className="text-[11px] text-white/35" style={{ fontFamily: "var(--font-mono)" }}>{tx.date} · #{tx.id}</p>
              </div>
              <span className="badge" style={{
                background: tx.asset === "BTC" ? "rgba(245,158,11,0.1)" : tx.asset === "ETH" ? "rgba(157,111,255,0.1)" : tx.asset === "USDC" ? "rgba(0,212,255,0.1)" : "rgba(0,240,160,0.1)",
                color: tx.asset === "BTC" ? "var(--gold-300)" : tx.asset === "ETH" ? "var(--accent-violet)" : tx.asset === "USDC" ? "var(--accent-teal)" : "var(--accent-emerald)",
                border: "1px solid transparent",
              }}>{tx.asset}</span>
              <p className="text-sm font-semibold text-right" style={{ fontFamily: "var(--font-mono)", color: tx.dir === "in" ? "var(--accent-emerald)" : "#ff6680" }}>
                {tx.dir === "in" ? "+" : ""}{Math.abs(tx.usd).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
              </p>
              <span className={`badge ${statusStyle[tx.status] || "badge-teal"}`} style={{ fontSize: "9px", justifySelf: "end" }}>{tx.status}</span>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-white/30 text-sm">No transactions match your filter.</div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-white/30" style={{ fontFamily: "var(--font-mono)" }}>
        <span>Showing {filtered.length} of {ALL_TX.length} transactions</span>
        <button className="px-3 py-1.5 rounded-lg transition-all" style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--glass-2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--glass-1)")}>
          Export CSV ↓
        </button>
      </div>
    </div>
  );
}
