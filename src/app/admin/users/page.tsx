"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getAdminUsers, createAdminUser, updateAdminUser, blockAdminUser, unblockAdminUser,
  getAdminUserAssets, updateAdminUserAssets,
  type SFUser, type AdminAsset,
} from "@/lib/api";

const BASE = "/api";
function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("sf_token") : null;
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}
async function adminFetch(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { const d = await res.json(); throw new Error((d as {error?:string}).error ?? "Failed"); }
  return res.json();
}

const ASSET_PRESETS = [
  { symbol: "BTC", name: "Bitcoin", usdRate: 83000, change: 0, color: "#f59e0b", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", usdRate: 2000, change: 0, color: "#9d6fff", icon: "Ξ" },
  { symbol: "USDC", name: "USD Coin", usdRate: 1, change: 0, color: "#00d4ff", icon: "$" },
  { symbol: "SOL", name: "Solana", usdRate: 130, change: 0, color: "#00f0a0", icon: "◎" },
  { symbol: "USDT", name: "Tether", usdRate: 1, change: 0, color: "#26a17b", icon: "₮" },
  { symbol: "BNB", name: "BNB", usdRate: 600, change: 0, color: "#f0b90b", icon: "B" },
  { symbol: "XRP", name: "XRP", usdRate: 2.2, change: 0, color: "#346aa9", icon: "✕" },
];

const BLANK_FORM = { name: "", email: "", password: "", caseId: "", maskedPhone: "", role: "client" as "client" | "admin", recoveredUsd: "", recoveryRate: "", recoveryComplete: false };

type EditMode = "profile" | "assets" | "banks" | "cards" | "transactions" | "recovery";

interface TimelineEvent { date: string; time: string; event: string; detail: string; status: "done" | "active" | "pending"; icon: string; }
interface EvidenceFile { name: string; type: string; size: string; date: string; }
interface LinkedBank { id: string; name: string; number: string; type: string; verified: boolean; country: string; }
interface Card { id: string; name: string; number: string; expiry: string; holder: string; limit: number; spent: number; status: string; frozen: boolean; gradient: string; accent: string; }
interface Transaction { id: string; type: string; asset: string; amount: string; usd: number; date: string; status: string; category: string; dir: string; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SFUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "client" | "admin">("all");
  const [confirmDelete, setConfirmDelete] = useState<SFUser | null>(null);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ ...BLANK_FORM });

  // Edit drawer
  const [editUser, setEditUser] = useState<SFUser | null>(null);
  const [editMode, setEditMode] = useState<EditMode>("profile");
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", maskedPhone: "", role: "client" as "client" | "admin", recoveredUsd: "", recoveryRate: "", recoveryComplete: false, openedDate: "", closedDate: "", originalClaim: "", recoveryDays: "", networksTraced: "", withdrawalOtp: "" });
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [usdInputs, setUsdInputs] = useState<Record<string, string>>({});
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [linkedBanks, setLinkedBanks] = useState<LinkedBank[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const refresh = useCallback(() => {
    getAdminUsers().then((d) => setUsers(d.users)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.caseId.toLowerCase().includes(q);
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const openEdit = async (u: SFUser) => {
    setEditUser(u);
    setEditMode("profile");
    setEditForm({ name: u.name, email: u.email, password: "", maskedPhone: u.maskedPhone ?? "", role: u.role, recoveredUsd: String(u.recoveredUsd), recoveryRate: String(u.recoveryRate), recoveryComplete: u.recoveryComplete, openedDate: (u as unknown as Record<string,string>).openedDate ?? "", closedDate: (u as unknown as Record<string,string>).closedDate ?? "", originalClaim: String((u as unknown as Record<string,number>).originalClaim ?? ""), recoveryDays: String((u as unknown as Record<string,number>).recoveryDays ?? ""), networksTraced: String((u as unknown as Record<string,number>).networksTraced ?? ""), withdrawalOtp: u.withdrawalOtp ?? "" });
    setAssetsLoading(true);
    setError("");
    try {
      const [assetsRes, tlRaw, evRaw, banksRaw, cardsRaw, txRaw] = await Promise.all([
        getAdminUserAssets(u.id),
        adminFetch(`/admin/users/${u.id}/timeline`).catch(() => ({ timeline: [] })),
        adminFetch(`/admin/users/${u.id}/evidence`).catch(() => ({ evidence: [] })),
        adminFetch(`/admin/users/${u.id}/linkedbanks`).catch(() => ({ linkedBanks: [] })),
        adminFetch(`/admin/users/${u.id}/cards`).catch(() => ({ cards: [] })),
        adminFetch(`/admin/users/${u.id}/transactions`).catch(() => ({ transactions: [] })),
      ]);
      const fetched = assetsRes.assets ?? [];
      setAssets(fetched);
      setUsdInputs(Object.fromEntries(fetched.map((a: AdminAsset) => [a.symbol, String(+(a.amount * a.usdRate).toFixed(2))])));
      setTimeline((tlRaw as {timeline: TimelineEvent[]}).timeline ?? []);
      setEvidence((evRaw as {evidence: EvidenceFile[]}).evidence ?? []);
      setLinkedBanks((banksRaw as {linkedBanks: LinkedBank[]}).linkedBanks ?? []);
      setCards((cardsRaw as {cards: Card[]}).cards ?? []);
      setTransactions((txRaw as {transactions: Transaction[]}).transactions ?? []);
    } catch { setAssets([]); setTimeline([]); setEvidence([]); setLinkedBanks([]); setCards([]); setTransactions([]); }
    finally { setAssetsLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await createAdminUser({ ...form, recoveredUsd: Number(form.recoveredUsd) || 0, recoveryRate: Number(form.recoveryRate) || 0 });
      setShowCreate(false);
      setForm({ ...BLANK_FORM });
      setLoading(true);
      refresh();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    setError(""); setSaving(true);
    try {
      const patch: Record<string, unknown> = { name: editForm.name, email: editForm.email, maskedPhone: editForm.maskedPhone, role: editForm.role, recoveredUsd: Number(editForm.recoveredUsd) || 0, recoveryRate: Number(editForm.recoveryRate) || 0, recoveryComplete: editForm.recoveryComplete, openedDate: editForm.openedDate || undefined, closedDate: editForm.closedDate || undefined, originalClaim: Number(editForm.originalClaim) || 0, recoveryDays: Number(editForm.recoveryDays) || 0, networksTraced: Number(editForm.networksTraced) || 0, withdrawalOtp: editForm.withdrawalOtp || undefined };
      if (editForm.password) patch.password = editForm.password;
      await updateAdminUser(editUser.id, patch as Parameters<typeof updateAdminUser>[1]);
      refresh();
      setEditUser(null);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleAssetsSave = async () => {
    if (!editUser) return;
    setError(""); setSaving(true);
    try {
      await updateAdminUserAssets(editUser.id, assets);
      refresh();
      setEditUser(null);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleRecoverySave = async () => {
    if (!editUser) return;
    setError(""); setSaving(true);
    try {
      await Promise.all([
        adminFetch(`/admin/users/${editUser.id}/timeline`, "PUT", { timeline }),
        adminFetch(`/admin/users/${editUser.id}/evidence`, "PUT", { evidence }),
      ]);
      setEditUser(null);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleBanksSave = async () => {
    if (!editUser) return;
    setError(""); setSaving(true);
    try {
      await adminFetch(`/admin/users/${editUser.id}/linkedbanks`, "PUT", { linkedBanks });
      setEditUser(null);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleCardsSave = async () => {
    if (!editUser) return;
    setError(""); setSaving(true);
    try {
      await adminFetch(`/admin/users/${editUser.id}/cards`, "PUT", { cards });
      setEditUser(null);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleTransactionsSave = async () => {
    if (!editUser) return;
    setError(""); setSaving(true);
    try {
      await adminFetch(`/admin/users/${editUser.id}/transactions`, "PUT", { transactions });
      setEditUser(null);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u: SFUser) => {
    setSaving(true);
    try {
      await adminFetch(`/admin/users/${u.id}`, "DELETE");
      setConfirmDelete(null);
      setEditUser(null);
      refresh();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleTerminateSessions = async (u: SFUser) => {
    setSaving(true);
    try {
      await adminFetch(`/admin/users/${u.id}/sessions`, "DELETE");
      refresh();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleBlock = async (u: SFUser) => {
    setSaving(true);
    try {
      if (u.blocked) await unblockAdminUser(u.id); else await blockAdminUser(u.id);
      refresh();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const addAsset = (symbol: string) => {
    if (assets.find((a) => a.symbol === symbol)) return;
    const preset = ASSET_PRESETS.find((p) => p.symbol === symbol);
    if (!preset) return;
    setAssets([...assets, { ...preset, amount: 0, usd: 0 }]);
    setUsdInputs(prev => ({ ...prev, [symbol]: "" }));
  };

  const updateAssetUsd = (symbol: string, raw: string) => {
    setUsdInputs(prev => ({ ...prev, [symbol]: raw }));
    const usd = parseFloat(raw);
    if (!isNaN(usd) && usd >= 0) {
      setAssets(assets.map(a => {
        if (a.symbol !== symbol) return a;
        const coinAmount = a.usdRate > 0 ? +(usd / a.usdRate).toFixed(8) : 0;
        return { ...a, amount: coinAmount, usd: +usd.toFixed(2) };
      }));
    }
  };

  const removeAsset = (symbol: string) => {
    setAssets(assets.filter((a) => a.symbol !== symbol));
    setUsdInputs(prev => { const n = { ...prev }; delete n[symbol]; return n; });
  };

  // Banks
  const addBank = () => setLinkedBanks([...linkedBanks, { id: "b" + Date.now().toString(36), name: "", number: "••••0000", type: "Checking", verified: false, country: "🇺🇸" }]);
  const updateBank = (i: number, k: keyof LinkedBank, v: string | boolean) => setLinkedBanks(linkedBanks.map((b, idx) => idx === i ? { ...b, [k]: v } : b));
  const removeBank = (i: number) => setLinkedBanks(linkedBanks.filter((_, idx) => idx !== i));

  // Cards
  const addCard = () => setCards([...cards, { id: "c" + Date.now().toString(36), name: "", number: "•••• •••• •••• 0000", expiry: "", holder: editUser?.name ?? "", limit: 10000, spent: 0, status: "active", frozen: false, gradient: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)", accent: "#00d4ff" }]);
  const updateCard = (i: number, k: keyof Card, v: string | number | boolean) => setCards(cards.map((c, idx) => idx === i ? { ...c, [k]: v } : c));
  const removeCard = (i: number) => setCards(cards.filter((_, idx) => idx !== i));

  // Transactions
  const addTransaction = () => setTransactions([{ id: "t" + Date.now().toString(36), type: "", asset: "USDC", amount: "+0 USDC", usd: 0, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), status: "complete", category: "recovery", dir: "in" }, ...transactions]);
  const updateTx = (i: number, k: keyof Transaction, v: string | number) => setTransactions(transactions.map((t, idx) => idx === i ? { ...t, [k]: v } : t));
  const removeTx = (i: number) => setTransactions(transactions.filter((_, idx) => idx !== i));

  const addTimelineEvent = () => setTimeline([...timeline, { date: "", time: "", event: "", detail: "", status: "pending", icon: "📋" }]);
  const updateTl = (i: number, k: keyof TimelineEvent, v: string) => setTimeline(timeline.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const removeTl = (i: number) => setTimeline(timeline.filter((_, idx) => idx !== i));

  const addEvidence = () => setEvidence([...evidence, { name: "", type: "PDF", size: "", date: "" }]);
  const updateEv = (i: number, k: keyof EvidenceFile, v: string) => setEvidence(evidence.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const removeEv = (i: number) => setEvidence(evidence.filter((_, idx) => idx !== i));

  const getSaveHandler = () => {
    switch (editMode) {
      case "assets": return handleAssetsSave;
      case "banks": return handleBanksSave;
      case "cards": return handleCardsSave;
      case "transactions": return handleTransactionsSave;
      case "recovery": return handleRecoverySave;
      default: return handleEditSave;
    }
  };

  const Spinner = () => (
    <span className="h-4 w-4 border-2 rounded-full animate-spin inline-block" style={{ borderColor: "var(--accent-teal)", borderTopColor: "transparent" }} />
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>ADMIN PORTAL</p>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Users</h1>
        </div>
        <button onClick={() => { setShowCreate(true); setError(""); }} className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80" style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))", color: "#04060d" }}>
          + New User
        </button>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

      {/* Search + filter */}
      <div className="flex gap-3">
        <input
          className="sf-input flex-1"
          placeholder="Search by name, email or case ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="sf-input w-32" value={filterRole} onChange={e => setFilterRole(e.target.value as "all" | "client" | "admin")}>
          <option value="all">All roles</option>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Spinner /></div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--glass-border)" }}>
            <p className="text-sm font-semibold text-white">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}{search || filterRole !== "all" ? " (filtered)" : ""}</p>
            <p className="text-xs text-white/30">{users.length} total</p>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--glass-border)" }}>
            {filteredUsers.map((u) => {
              const ini = u.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={u.id} className="flex items-center gap-3 p-4">
                  <span className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: u.role === "admin" ? "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))" : "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#04060d", opacity: u.blocked ? 0.4 : 1 }}>
                    {ini}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white" style={{ opacity: u.blocked ? 0.5 : 1 }}>{u.name}</p>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: u.role === "admin" ? "rgba(0,212,255,0.1)" : "rgba(245,158,11,0.1)", color: u.role === "admin" ? "var(--accent-teal)" : "#f59e0b" }}>
                        {u.role.toUpperCase()}
                      </span>
                      {u.blocked && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">BLOCKED</span>}
                    </div>
                    <p className="text-xs text-white/40 truncate">{u.email}</p>
                    <p className="text-xs text-white/30" style={{ fontFamily: "var(--font-mono)" }}>{u.caseId}</p>
                  </div>
                  <div className="text-right hidden sm:block shrink-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--accent-emerald)" }}>${u.recoveredUsd.toLocaleString()}</p>
                    <p className="text-xs text-white/30">{u.recoveryRate}%</p>
                  </div>
                  <div className="flex gap-1 shrink-0 flex-col sm:flex-row items-end sm:items-center">
                    <button onClick={() => openEdit(u)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80" style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent-teal)" }}>Edit</button>
                    <button onClick={() => handleBlock(u)} disabled={saving} className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80" style={{ background: u.blocked ? "rgba(0,255,136,0.1)" : "rgba(239,68,68,0.1)", color: u.blocked ? "var(--accent-emerald)" : "#f87171" }}>
                      {u.blocked ? "Unblock" : "Block"}
                    </button>
                    <button onClick={() => handleTerminateSessions(u)} disabled={saving} className="hidden sm:block px-2.5 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }} title="Force logout all active sessions">
                      Kick
                    </button>
                    <button onClick={() => setConfirmDelete(u)} className="hidden sm:block px-2.5 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }} title="Permanently delete user">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredUsers.length === 0 && <p className="text-sm text-white/30 text-center py-10">{search ? "No users match your search." : "No users yet."}</p>}
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,6,13,0.9)", backdropFilter: "blur(8px)" }}>
          <div className="glass-card rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Delete User?</h2>
            <p className="text-sm text-white/50">This will permanently delete <span className="text-white font-semibold">{confirmDelete.name}</span> and all their data (assets, transactions, cards, banks, timeline). This cannot be undone.</p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white border transition-colors" style={{ borderColor: "var(--glass-border)" }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-80" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
                {saving ? <Spinner /> : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create User Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,6,13,0.85)", backdropFilter: "blur(8px)" }}>
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Create User</h2>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
            </div>
            {error && <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-white/40 mb-1 block">Full Name *</label>
                  <input className="sf-input w-full" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/40 mb-1 block">Email *</label>
                  <input className="sf-input w-full" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Password *</label>
                  <input className="sf-input w-full" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Case ID *</label>
                  <input className="sf-input w-full" required value={form.caseId} onChange={(e) => setForm({ ...form, caseId: e.target.value })} placeholder="SF-2025-1234" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Phone (masked)</label>
                  <input className="sf-input w-full" value={form.maskedPhone} onChange={(e) => setForm({ ...form, maskedPhone: e.target.value })} placeholder="+44 •• ••••" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Role</label>
                  <select className="sf-input w-full" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "client" | "admin" })}>
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Recovered USD</label>
                  <input className="sf-input w-full" type="number" min="0" value={form.recoveredUsd} onChange={(e) => setForm({ ...form, recoveredUsd: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Recovery Rate %</label>
                  <input className="sf-input w-full" type="number" min="0" max="100" value={form.recoveryRate} onChange={(e) => setForm({ ...form, recoveryRate: e.target.value })} placeholder="0" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.recoveryComplete} onChange={(e) => setForm({ ...form, recoveryComplete: e.target.checked })} className="rounded" />
                <span className="text-sm text-white/60">Recovery Complete</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white border transition-colors" style={{ borderColor: "var(--glass-border)" }}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-80" style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))", color: "#04060d" }}>
                  {saving ? <Spinner /> : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Drawer ── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,6,13,0.85)", backdropFilter: "blur(8px)" }}>
          <div className="glass-card rounded-2xl w-full max-w-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate" style={{ fontFamily: "var(--font-display)" }}>{editUser.name}</h2>
                <p className="text-xs text-white/40 truncate" style={{ fontFamily: "var(--font-mono)" }}>{editUser.caseId} · {editUser.email}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => handleTerminateSessions(editUser)} disabled={saving} className="px-2 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }} title="Force logout">Kick</button>
                <button onClick={() => { setEditUser(null); setConfirmDelete(editUser); }} className="px-2 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>Del</button>
                <button onClick={() => setEditUser(null)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-none" style={{ background: "rgba(255,255,255,0.04)" }}>
              {(["profile", "assets", "banks", "cards", "transactions", "recovery"] as EditMode[]).map((m) => (
                <button key={m} onClick={() => setEditMode(m)}
                  className="flex-shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold capitalize transition-all whitespace-nowrap"
                  style={{ background: editMode === m ? "rgba(0,212,255,0.15)" : "transparent", color: editMode === m ? "var(--accent-teal)" : "rgba(255,255,255,0.4)" }}>
                  {m}
                </button>
              ))}
            </div>

            {error && <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

            {/* ── Profile ── */}
            {editMode === "profile" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className="text-xs text-white/40 mb-1 block">Full Name</label>
                    <input className="sf-input w-full" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                  <div className="col-span-2"><label className="text-xs text-white/40 mb-1 block">Email</label>
                    <input className="sf-input w-full" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} /></div>
                  <div><label className="text-xs text-white/40 mb-1 block">New Password</label>
                    <input className="sf-input w-full" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} placeholder="Leave blank to keep" /></div>
                  <div><label className="text-xs text-white/40 mb-1 block">Phone (masked)</label>
                    <input className="sf-input w-full" value={editForm.maskedPhone} onChange={e => setEditForm({...editForm, maskedPhone: e.target.value})} /></div>
                  <div><label className="text-xs text-white/40 mb-1 block">Role</label>
                    <select className="sf-input w-full" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value as "client"|"admin"})}>
                      <option value="client">Client</option><option value="admin">Admin</option>
                    </select></div>
                  <div><label className="text-xs text-white/40 mb-1 block">Recovered USD</label>
                    <input className="sf-input w-full" type="number" min="0" value={editForm.recoveredUsd} onChange={e => setEditForm({...editForm, recoveredUsd: e.target.value})} /></div>
                  <div><label className="text-xs text-white/40 mb-1 block">Recovery Rate %</label>
                    <input className="sf-input w-full" type="number" min="0" max="100" value={editForm.recoveryRate} onChange={e => setEditForm({...editForm, recoveryRate: e.target.value})} /></div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.recoveryComplete} onChange={e => setEditForm({...editForm, recoveryComplete: e.target.checked})} />
                  <span className="text-sm text-white/60">Recovery Complete</span>
                </label>
                <div className="pt-3 border-t space-y-3" style={{ borderColor: "var(--glass-border)" }}>
                  <p className="text-xs text-white/30" style={{ fontFamily: "var(--font-mono)" }}>RECOVERY META</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-white/40 mb-1 block">Opened Date</label>
                      <input className="sf-input w-full" value={editForm.openedDate} onChange={e => setEditForm({...editForm, openedDate: e.target.value})} placeholder="Mar 1, 2026" /></div>
                    <div><label className="text-xs text-white/40 mb-1 block">Closed Date</label>
                      <input className="sf-input w-full" value={editForm.closedDate} onChange={e => setEditForm({...editForm, closedDate: e.target.value})} placeholder="Leave blank if open" /></div>
                    <div><label className="text-xs text-white/40 mb-1 block">Original Claim (USD)</label>
                      <input className="sf-input w-full" type="number" min="0" value={editForm.originalClaim} onChange={e => setEditForm({...editForm, originalClaim: e.target.value})} /></div>
                    <div><label className="text-xs text-white/40 mb-1 block">Recovery Days</label>
                      <input className="sf-input w-full" type="number" min="0" value={editForm.recoveryDays} onChange={e => setEditForm({...editForm, recoveryDays: e.target.value})} /></div>
                    <div><label className="text-xs text-white/40 mb-1 block">Networks Traced</label>
                      <input className="sf-input w-full" type="number" min="0" value={editForm.networksTraced} onChange={e => setEditForm({...editForm, networksTraced: e.target.value})} /></div>
                  </div>
                </div>
                <div className="pt-3 border-t space-y-2" style={{ borderColor: "var(--glass-border)" }}>
                  <p className="text-xs text-white/30" style={{ fontFamily: "var(--font-mono)" }}>WITHDRAWAL AUTHORIZATION</p>
                  <label className="text-xs text-white/40 mb-1 block">Withdrawal OTP</label>
                  <input className="sf-input w-full" value={editForm.withdrawalOtp} onChange={e => setEditForm({...editForm, withdrawalOtp: e.target.value})} placeholder="Set passcode for this user's withdrawals" />
                  <p className="text-[10px] text-white/25">Leave blank to block all withdrawals for this user.</p>
                </div>
              </div>
            )}

            {/* ── Assets ── */}
            {editMode === "assets" && (
              <div className="space-y-4">
                {assetsLoading ? <div className="flex justify-center py-6"><Spinner /></div> : <>
                  <div className="space-y-2">
                    {assets.map(a => (
                      <div key={a.symbol} className="p-3 rounded-xl space-y-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <div className="flex items-center gap-2">
                          <span className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: a.color+"20", color: a.color }}>{a.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">{a.name} <span className="text-white/40">({a.symbol})</span></p>
                            <p className="text-[10px] text-white/30">@ ${a.usdRate.toLocaleString()} per {a.symbol}</p>
                          </div>
                          <button onClick={() => removeAsset(a.symbol)} className="text-white/30 hover:text-red-400 text-lg leading-none shrink-0">×</button>
                        </div>
                        <div className="space-y-1">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40 pointer-events-none">$</span>
                            <input
                              type="number" min="0" step="any"
                              placeholder="Enter USD value"
                              value={usdInputs[a.symbol] ?? ""}
                              onChange={e => updateAssetUsd(a.symbol, e.target.value)}
                              className="sf-input pl-6 w-full text-sm"
                            />
                          </div>
                          {a.amount > 0 && (
                            <p className="text-[10px] text-white/40 text-right px-1" style={{ fontFamily: "var(--font-mono)" }}>
                              = {a.amount.toLocaleString(undefined, {maximumFractionDigits: 8})} {a.symbol}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {assets.length === 0 && <p className="text-xs text-white/30 text-center py-4">No assets. Add one below.</p>}
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-2">Add asset</p>
                    <div className="flex flex-wrap gap-2">
                      {ASSET_PRESETS.filter(p => !assets.find(a => a.symbol === p.symbol)).map(p => (
                        <button key={p.symbol} onClick={() => addAsset(p.symbol)} className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity" style={{ background: p.color+"20", color: p.color }}>+ {p.symbol}</button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl text-sm font-semibold" style={{ background: "rgba(0,255,136,0.06)", color: "var(--accent-emerald)" }}>
                    Total: ${assets.reduce((s,a) => s+a.usd, 0).toLocaleString(undefined,{maximumFractionDigits:2})}
                  </div>
                </>}
              </div>
            )}

            {/* ── Banks ── */}
            {editMode === "banks" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>LINKED BANK ACCOUNTS</p>
                  <button onClick={addBank} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent-teal)" }}>+ Add</button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {linkedBanks.map((b, i) => (
                    <div key={b.id} className="p-3 rounded-xl space-y-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="sm:col-span-2"><label className="text-[10px] text-white/30 mb-0.5 block">Bank Name</label>
                          <input className="sf-input text-xs w-full" value={b.name} onChange={e => updateBank(i, "name", e.target.value)} placeholder="Chase Bank" /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Account Number</label>
                          <input className="sf-input text-xs w-full" value={b.number} onChange={e => updateBank(i, "number", e.target.value)} placeholder="••••1234" /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Type</label>
                          <select className="sf-input text-xs w-full" value={b.type} onChange={e => updateBank(i, "type", e.target.value)}>
                            <option>Checking</option><option>Savings</option><option>Business</option>
                          </select></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Country Flag</label>
                          <input className="sf-input text-xs w-full" value={b.country} onChange={e => updateBank(i, "country", e.target.value)} placeholder="🇺🇸" /></div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={b.verified} onChange={e => updateBank(i, "verified", e.target.checked)} />
                          <span className="text-xs text-white/50">Verified</span>
                        </div>
                      </div>
                      <button onClick={() => removeBank(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ))}
                  {linkedBanks.length === 0 && <p className="text-xs text-white/30 text-center py-6">No linked banks. Add one above.</p>}
                </div>
              </div>
            )}

            {/* ── Cards ── */}
            {editMode === "cards" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>VIRTUAL CARDS</p>
                  <button onClick={addCard} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent-teal)" }}>+ Add</button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cards.map((c, i) => (
                    <div key={c.id} className="p-3 rounded-xl space-y-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="sm:col-span-2"><label className="text-[10px] text-white/30 mb-0.5 block">Card Label</label>
                          <input className="sf-input text-xs w-full" value={c.name} onChange={e => updateCard(i, "name", e.target.value)} placeholder="Primary Card" /></div>
                        <div className="sm:col-span-2"><label className="text-[10px] text-white/30 mb-0.5 block">Card Number</label>
                          <input className="sf-input text-xs w-full" value={c.number} onChange={e => updateCard(i, "number", e.target.value)} placeholder="•••• •••• •••• 0000" /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Expiry</label>
                          <input className="sf-input text-xs w-full" value={c.expiry} onChange={e => updateCard(i, "expiry", e.target.value)} placeholder="12/28" /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Holder</label>
                          <input className="sf-input text-xs w-full" value={c.holder} onChange={e => updateCard(i, "holder", e.target.value)} /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Limit (USD)</label>
                          <input className="sf-input text-xs w-full" type="number" min="0" value={c.limit} onChange={e => updateCard(i, "limit", parseFloat(e.target.value)||0)} /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Spent (USD)</label>
                          <input className="sf-input text-xs w-full" type="number" min="0" value={c.spent} onChange={e => updateCard(i, "spent", parseFloat(e.target.value)||0)} /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Status</label>
                          <select className="sf-input text-xs w-full" value={c.status} onChange={e => updateCard(i, "status", e.target.value)}>
                            <option value="active">Active</option><option value="inactive">Inactive</option><option value="expired">Expired</option>
                          </select></div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={c.frozen} onChange={e => updateCard(i, "frozen", e.target.checked)} />
                          <span className="text-xs text-white/50">Frozen</span>
                        </div>
                      </div>
                      <button onClick={() => removeCard(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ))}
                  {cards.length === 0 && <p className="text-xs text-white/30 text-center py-6">No cards. Add one above.</p>}
                </div>
              </div>
            )}

            {/* ── Transactions ── */}
            {editMode === "transactions" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>TRANSACTION HISTORY</p>
                  <button onClick={addTransaction} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent-teal)" }}>+ Add</button>
                </div>
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {transactions.map((t, i) => (
                    <div key={t.id} className="p-3 rounded-xl space-y-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="sm:col-span-2"><label className="text-[10px] text-white/30 mb-0.5 block">Description</label>
                          <input className="sf-input text-xs w-full" value={t.type} onChange={e => updateTx(i, "type", e.target.value)} placeholder="Recovery Credit" /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Asset</label>
                          <input className="sf-input text-xs w-full" value={t.asset} onChange={e => updateTx(i, "asset", e.target.value)} placeholder="BTC" /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Amount (display)</label>
                          <input className="sf-input text-xs w-full" value={t.amount} onChange={e => updateTx(i, "amount", e.target.value)} placeholder="+1.2 BTC" /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">USD Value</label>
                          <input className="sf-input text-xs w-full" type="number" value={t.usd} onChange={e => updateTx(i, "usd", parseFloat(e.target.value)||0)} /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Date</label>
                          <input className="sf-input text-xs w-full" value={t.date} onChange={e => updateTx(i, "date", e.target.value)} placeholder="Mar 8, 2026" /></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Status</label>
                          <select className="sf-input text-xs w-full" value={t.status} onChange={e => updateTx(i, "status", e.target.value)}>
                            <option value="complete">Complete</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="failed">Failed</option>
                          </select></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Category</label>
                          <select className="sf-input text-xs w-full" value={t.category} onChange={e => updateTx(i, "category", e.target.value)}>
                            <option value="recovery">Recovery</option><option value="transfer">Transfer</option><option value="yield">Yield</option><option value="fee">Fee</option><option value="exchange">Exchange</option>
                          </select></div>
                        <div><label className="text-[10px] text-white/30 mb-0.5 block">Direction</label>
                          <select className="sf-input text-xs w-full" value={t.dir} onChange={e => updateTx(i, "dir", e.target.value)}>
                            <option value="in">In (credit)</option><option value="out">Out (debit)</option>
                          </select></div>
                      </div>
                      <button onClick={() => removeTx(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="text-xs text-white/30 text-center py-6">No transactions. Add one above.</p>}
                </div>
              </div>
            )}

            {/* ── Recovery ── */}
            {editMode === "recovery" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>TIMELINE EVENTS</p>
                    <button onClick={addTimelineEvent} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent-teal)" }}>+ Add</button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {timeline.map((ev, i) => (
                      <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <div className="grid grid-cols-2 gap-2">
                          <input className="sf-input text-xs" value={ev.event} onChange={e => updateTl(i,"event",e.target.value)} placeholder="Event title" />
                          <input className="sf-input text-xs" value={ev.date} onChange={e => updateTl(i,"date",e.target.value)} placeholder="Mar 8, 2026" />
                          <input className="sf-input text-xs" value={ev.time} onChange={e => updateTl(i,"time",e.target.value)} placeholder="08:00 UTC" />
                          <select className="sf-input text-xs" value={ev.status} onChange={e => updateTl(i,"status",e.target.value)}>
                            <option value="done">Done</option><option value="active">Active</option><option value="pending">Pending</option>
                          </select>
                        </div>
                        <input className="sf-input text-xs w-full" value={ev.detail} onChange={e => updateTl(i,"detail",e.target.value)} placeholder="Detail description" />
                        <div className="flex justify-between items-center">
                          <input className="sf-input text-xs w-16" value={ev.icon} onChange={e => updateTl(i,"icon",e.target.value)} placeholder="📋" />
                          <button onClick={() => removeTl(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                        </div>
                      </div>
                    ))}
                    {timeline.length === 0 && <p className="text-xs text-white/30 text-center py-3">No timeline events.</p>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>EVIDENCE FILES</p>
                    <button onClick={addEvidence} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent-teal)" }}>+ Add</button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {evidence.map((ev, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <input className="sf-input text-xs col-span-2" value={ev.name} onChange={e => updateEv(i,"name",e.target.value)} placeholder="Document name" />
                        <input className="sf-input text-xs" value={ev.type} onChange={e => updateEv(i,"type",e.target.value)} placeholder="PDF" />
                        <input className="sf-input text-xs" value={ev.size} onChange={e => updateEv(i,"size",e.target.value)} placeholder="2.1 MB" />
                        <input className="sf-input text-xs" value={ev.date} onChange={e => updateEv(i,"date",e.target.value)} placeholder="Mar 8, 2026" />
                        <button onClick={() => removeEv(i)} className="text-xs text-red-400 hover:text-red-300 text-left">Remove</button>
                      </div>
                    ))}
                    {evidence.length === 0 && <p className="text-xs text-white/30 text-center py-3">No evidence files.</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "var(--glass-border)" }}>
              <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white border transition-colors" style={{ borderColor: "var(--glass-border)" }}>Cancel</button>
              <button onClick={getSaveHandler()} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-80" style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))", color: "#04060d" }}>
                {saving ? <Spinner /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
