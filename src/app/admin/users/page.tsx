"use client";
import { useState, useEffect } from "react";
import { getAdminUsers, type SFUser } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SFUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminUsers()
      .then((d) => setUsers(d.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>ADMIN PORTAL</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Users</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="h-8 w-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--accent-teal)", borderTopColor: "transparent" }}/>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: "var(--glass-border)" }}>
            <p className="text-sm font-semibold text-white">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--glass-border)" }}>
            {users.map((u) => {
              const initials = u.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={u.id} className="flex items-center gap-4 p-4">
                  <span className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: u.role === "admin" ? "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))" : "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#04060d" }}>
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{u.name}</p>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: u.role === "admin" ? "rgba(0,212,255,0.1)" : "rgba(245,158,11,0.1)", color: u.role === "admin" ? "var(--accent-teal)" : "#f59e0b" }}>
                        {u.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">{u.email}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-white/50" style={{ fontFamily: "var(--font-mono)" }}>{u.caseId}</p>
                    <p className="text-xs text-white/30">Since {u.clientSince}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: "var(--accent-emerald)" }}>
                      ${u.recoveredUsd.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/30">{u.recoveryRate}% recovered</p>
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <p className="text-sm text-white/30 text-center py-10">No users found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
