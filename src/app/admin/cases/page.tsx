"use client";
import { useState, useEffect } from "react";
import { getAdminCases, patchAdminCase, type IntakeCase } from "@/lib/api";

const STATUS_OPTIONS: IntakeCase["status"][] = ["new", "reviewing", "in_progress", "closed"];

const statusStyle: Record<IntakeCase["status"], { bg: string; text: string }> = {
  new:         { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b" },
  reviewing:   { bg: "rgba(157,111,255,0.1)", text: "#9d6fff" },
  in_progress: { bg: "rgba(0,212,255,0.1)",   text: "#00d4ff" },
  closed:      { bg: "rgba(0,240,160,0.1)",   text: "#00f0a0" },
};

export default function AdminCasesPage() {
  const [cases, setCases] = useState<IntakeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<IntakeCase["status"] | "all">("all");

  useEffect(() => {
    getAdminCases()
      .then((d) => setCases(d.cases))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? cases : cases.filter((c) => c.status === filter);

  async function updateStatus(id: string, status: IntakeCase["status"]) {
    setUpdating(id);
    try {
      const res = await patchAdminCase(id, status);
      setCases((prev) => prev.map((c) => c.id === id ? res.case : c));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>ADMIN PORTAL</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Cases</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", ...STATUS_OPTIONS] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === s ? "var(--accent-teal)" : "var(--glass-1)",
              color: filter === s ? "#04060d" : "var(--fg-secondary)",
              border: "1px solid var(--glass-border)",
            }}>
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="h-8 w-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--accent-teal)", borderTopColor: "transparent" }}/>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const st = statusStyle[c.status];
            const isOpen = expanded === c.id;
            return (
              <div key={c.id} className="glass-card rounded-2xl overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : c.id)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{c.fullName}</p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                        style={{ background: st.bg, color: st.text }}>
                        {c.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{c.incidentType} · {c.email} · {c.submittedAt}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    className={`ml-3 shrink-0 text-white/30 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: "var(--glass-border)" }}>
                    <div className="grid sm:grid-cols-2 gap-3 pt-3">
                      {[
                        ["Case ID", c.id],
                        ["Name", c.fullName],
                        ["Email", c.email],
                        ["Contact", c.contactChannel],
                        ["Incident Type", c.incidentType],
                        ["Incident Date", c.incidentDate || "—"],
                        ["Loss Estimate", c.lossEstimate || "—"],
                        ["Submitted", c.submittedAt],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[10px] text-white/30 mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
                          <p className="text-sm text-white">{val}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>NARRATIVE</p>
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{c.narrative}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 mb-2" style={{ fontFamily: "var(--font-mono)" }}>UPDATE STATUS</p>
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.map((s) => (
                          <button key={s} onClick={() => updateStatus(c.id, s)}
                            disabled={c.status === s || updating === c.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                            style={{
                              background: c.status === s ? statusStyle[s].bg : "var(--glass-2)",
                              color: c.status === s ? statusStyle[s].text : "var(--fg-secondary)",
                              border: `1px solid ${c.status === s ? statusStyle[s].text + "40" : "var(--glass-border)"}`,
                            }}>
                            {updating === c.id ? "…" : s.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="glass-card rounded-2xl p-10 text-center text-white/30">
              No cases found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
