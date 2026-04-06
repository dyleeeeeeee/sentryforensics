"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getStoredUser, getMe, logout, type StoredUser } from "@/lib/api";

const navItems = [
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    label: "Overview", href: "/admin",
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    label: "Cases", href: "/admin/cases",
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    label: "Users", href: "/admin/users",
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    // Not logged in at all
    if (!stored) { router.replace("/banking"); return; }
    // Logged in as a client — send to their portal
    if (stored.role !== "admin") { router.replace("/banking/dashboard"); return; }

    // Re-validate token against the server
    getMe()
      .then(({ user: freshUser }) => {
        if (freshUser.role !== "admin") { router.replace("/banking/dashboard"); return; }
        setUser(freshUser);
        setChecked(true);
      })
      .catch(() => {
        localStorage.removeItem("sf_token");
        localStorage.removeItem("sf_user");
        router.replace("/banking");
      });
  }, [router]);

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    router.push("/banking");
  }

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  if (!checked) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
      <span className="h-8 w-8 border-2 rounded-full animate-spin"
        style={{ borderColor: "var(--accent-teal)", borderTopColor: "transparent" }}/>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "var(--font-body)" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`banking-sidebar fixed top-0 left-0 z-40 h-full w-60 flex-col transition-transform duration-300 lg:translate-x-0 lg:flex ${sidebarOpen ? "flex translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(157,111,255,0.12))", border: "1px solid rgba(0,212,255,0.25)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <p className="text-xs font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>Sentry Admin</p>
              <p className="text-[9px] tracking-[0.18em] mt-px" style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)" }}>ADMIN PORTAL</p>
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
              <p className="text-[10px] truncate" style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)" }}>ADMINISTRATOR</p>
            </div>
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
            <span style={{ color: "var(--accent-teal)" }}>ADMIN PORTAL</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
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

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
