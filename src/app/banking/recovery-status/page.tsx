"use client";
import { useState, useEffect } from "react";
import { getRecoveryStatus, type RecoveryStatusData } from "@/lib/api";

export default function RecoveryStatusPage() {
  const [data, setData] = useState<RecoveryStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(5);

  useEffect(() => {
    getRecoveryStatus().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="h-8 w-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--accent-teal)", borderTopColor: "transparent" }}/>
    </div>
  );
  if (!data) return <div className="text-center text-white/40 py-16">Failed to load recovery status.</div>;

  const { caseId, status: caseStatus, recoveredUsd, recoveryRate, openedDate, closedDate, originalClaim, recoveryDays, networksTraced, timeline, evidence } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>BANKING PORTAL</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Recovery Status</h1>
      </div>

      {/* Case header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(0,240,160,0.07), rgba(0,212,255,0.04))", border: "1px solid rgba(0,240,160,0.15)" }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,240,160,0.4), transparent)" }}/>
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,240,160,0.1)", border: "1px solid rgba(0,240,160,0.2)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Case #{caseId}</h2>
              <span className="badge badge-success">{caseStatus.toUpperCase()}</span>
            </div>
            <p className="text-sm text-white/45 mt-1">Multi-chain phishing recovery · Opened {openedDate}{closedDate ? ` · Closed ${closedDate}` : ""}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center sm:text-right">
            <div>
              <p className="text-xs text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>RECOVERED</p>
              <p className="text-xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--accent-emerald)" }}>${recoveredUsd.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>RATE</p>
              <p className="text-xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--accent-teal)" }}>{recoveryRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Original Claim", value: `$${originalClaim.toLocaleString()}`, sub: "Across all assets" },
          { label: "Time to Recovery", value: `${recoveryDays} days`, sub: `${openedDate}${closedDate ? ` → ${closedDate}` : ""}` },
          { label: "Networks Traced", value: `${networksTraced} chains`, sub: "BTC · ETH · SOL" },
        ].map(item => (
          <div key={item.label} className="glass-card rounded-xl p-4 text-center">
            <p className="text-xs text-white/30 mb-2" style={{ fontFamily: "var(--font-mono)" }}>{item.label}</p>
            <p className="text-xl font-extrabold text-white mb-0.5" style={{ fontFamily: "var(--font-display)" }}>{item.value}</p>
            <p className="text-xs text-white/35">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--glass-border)" }}>
          <h2 className="font-semibold text-white">Case Timeline</h2>
        </div>
        <div className="p-6">
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: "var(--glass-border)" }}/>
            <div className="space-y-4">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all"
                      style={{
                        background: event.status === "done" ? "rgba(0,240,160,0.12)" : event.status === "active" ? "rgba(0,212,255,0.12)" : "var(--glass-1)",
                        border: `1px solid ${event.status === "done" ? "rgba(0,240,160,0.25)" : event.status === "active" ? "rgba(0,212,255,0.25)" : "var(--glass-border)"}`,
                        boxShadow: event.status === "active" ? "0 0 20px rgba(0,212,255,0.2)" : "none",
                      }}>
                      {event.icon}
                    </div>
                  </div>
                  <button className="flex-1 text-left pb-4" onClick={() => setExpandedEvent(expandedEvent === i ? null : i)}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{event.event}</p>
                        <p className="text-[10px] text-white/30 mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>{event.date} · {event.time}</p>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        className="flex-shrink-0 mt-1 text-white/20 transition-transform"
                        style={{ transform: expandedEvent === i ? "rotate(180deg)" : "none" }}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>
                    {expandedEvent === i && (
                      <p className="mt-2 text-sm text-white/55 leading-6">{event.detail}</p>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence files */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--glass-border)" }}>
          <h2 className="font-semibold text-white">Evidence & Reports</h2>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--glass-border)" }}>
          {evidence.map(file => (
            <div key={file.name} className="flex items-center gap-4 px-6 py-4 transition-all cursor-pointer"
              onMouseEnter={e => (e.currentTarget.style.background = "var(--glass-1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.15)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                <p className="text-xs text-white/30" style={{ fontFamily: "var(--font-mono)" }}>{file.type} · {file.size} · {file.date}</p>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
