"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getStoredUser, logout, type StoredUser } from "@/lib/api";

export default function BankingLayoutInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  useEffect(() => { setUser(getStoredUser()); }, []);
  const initials = user?.name ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() : "";
  return <BankingLayoutShell user={user} initials={initials}>{children}</BankingLayoutShell>;
}

const navItems = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
    label: "Dashboard", href: "/banking/dashboard",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20M4 20V10l8-6 8 6v10"/>
        <path d="M10 20v-6h4v6"/>
      </svg>
    ),
    label: "Accounts", href: "/banking/accounts",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
      </svg>
    ),
    label: "Transactions", href: "/banking/transactions",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    ),
    label: "Transfer", href: "/banking/transfer",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="M2 10h20"/>
      </svg>
    ),
    label: "Cards", href: "/banking/cards",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    label: "Recovery Status", href: "/banking/recovery-status",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
    label: "Settings", href: "/banking/settings",
  },
];

function BankingLayoutShell({ children, user, initials }: { children: React.ReactNode; user: StoredUser | null; initials: string }) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    router.push("/banking");
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "var(--font-body)" }}>
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`banking-sidebar fixed top-0 left-0 z-40 h-full w-60 flex-col transition-transform duration-300 lg:translate-x-0 lg:flex ${sidebarOpen ? "flex translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(253,211,77,0.12))", border: "1px solid rgba(245,158,11,0.25)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <p className="text-xs font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>Sentry Banking</p>
              <p className="text-[9px] tracking-[0.18em] mt-px" style={{ color: "var(--gold-400)", fontFamily: "var(--font-mono)" }}>PRIVATE PORTAL</p>
            </div>
          </Link>
        </div>

        {/* User card */}
        <div className="mx-3 mt-4 p-3 rounded-xl" style={{ background: "var(--glass-2)", border: "1px solid var(--glass-border)" }}>
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))", color: "#04060d" }}>
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name ?? ""}</p>
              <p className="text-[10px] truncate" style={{ color: "var(--fg-tertiary)", fontFamily: "var(--font-mono)" }}>Case #{user?.caseId ?? ""}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse-dot" style={{ background: "var(--accent-emerald)" }}/>
            <span className="text-[10px]" style={{ color: "var(--accent-emerald)", fontFamily: "var(--font-mono)" }}>RECOVERY COMPLETE</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-3 pb-2 text-[9px] font-semibold tracking-[0.2em] text-white/25" style={{ fontFamily: "var(--font-mono)" }}>NAVIGATION</p>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`banking-nav-item ${pathname === item.href ? "active" : ""}`}>
              <span className="opacity-70">{item.icon}</span>
              <span className="text-[13px]">{item.label}</span>
              {item.label === "Recovery Status" && (
                <span className="ml-auto badge badge-success" style={{ fontSize: "9px", padding: "1px 6px" }}>DONE</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-1" style={{ borderTop: "1px solid var(--glass-border)" }}>
          <button
            onClick={handleLogout}
            className="banking-nav-item w-full justify-start gap-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
          <Link href="/" className="banking-nav-item justify-start gap-2 text-xs text-white/25 hover:text-white/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to main site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between px-6"
          style={{ background: "rgba(4,6,13,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--glass-border)" }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          <div className="hidden lg:flex items-center gap-2 text-xs text-white/35" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="tracking-[0.15em]">SENTRY FORENSICS</span>
            <span className="mx-2 text-white/15">/</span>
            <span style={{ color: "var(--gold-300)" }}>PRIVATE BANKING PORTAL</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))", color: "#04060d" }}>
              {initials}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
