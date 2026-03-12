"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminCases, getAdminUsers, type IntakeCase, type SFUser } from "@/lib/api";

export default function AdminOverviewPage() {
  const [cases, setCases] = useState<IntakeCase[]>([]);
  const [users, setUsers] = useState<SFUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminCases(), getAdminUsers()])
      .then(([c, u]) => {
        setCases(c.cases);
        setUsers(u.users);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const newCases = cases.filter((c) => c.status === "new").length;
  const activeCases = cases.filter((c) => c.status === "in_progress" || c.status === "reviewing").length;
  const closedCases = cases.filter((c) => c.status === "closed").length;

  const stats = [
    { label: "Total Cases", value: cases.length, color: "var(--accent-teal)" },
    { label: "New / Unreviewed", value: newCases, color: "#f59e0b" },
    { label: "Active", value: activeCases, color: "var(--accent-violet)" },
    { label: "Closed", value: closedCases, color: "var(--accent-emerald)" },
    { label: "Total Users", value: users.length, color: "var(--fg-secondary)" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>ADMIN PORTAL</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Overview</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="h-8 w-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--accent-teal)", borderTopColor: "transparent" }}/>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-4 space-y-1">
                <p className="text-xs text-white/40">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Recent Cases</h2>
              <Link href="/admin/cases" className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)" }}>
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {cases.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                  style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.fullName}</p>
                    <p className="text-xs text-white/40 truncate">{c.incidentType} · {c.submittedAt}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ml-3 shrink-0 ${
                    c.status === "new" ? "bg-yellow-500/10 text-yellow-400" :
                    c.status === "reviewing" ? "bg-violet-500/10 text-violet-400" :
                    c.status === "in_progress" ? "bg-teal-500/10 text-teal-400" :
                    "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {c.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              ))}
              {cases.length === 0 && (
                <p className="text-sm text-white/30 text-center py-6">No cases yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
