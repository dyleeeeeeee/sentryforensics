"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getAdminUsers, createAdminUser, updateAdminUser, blockAdminUser, unblockAdminUser,
  getAdminUserAssets, updateAdminUserAssets,
  type SFUser, type AdminAsset,
} from "@/lib/api";

const ASSET_PRESETS = [
  { symbol: "BTC", name: "Bitcoin", usdRate: 60772, change: 2.34, color: "#f59e0b", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", usdRate: 3010, change: -0.87, color: "#9d6fff", icon: "Ξ" },
  { symbol: "USDC", name: "USD Coin", usdRate: 1, change: 0.01, color: "#00d4ff", icon: "$" },
  { symbol: "SOL", name: "Solana", usdRate: 130, change: 5.12, color: "#00f0a0", icon: "◎" },
  { symbol: "USDT", name: "Tether", usdRate: 1, change: 0.00, color: "#26a17b", icon: "₮" },
];

const BLANK_FORM = { name: "", email: "", password: "", caseId: "", maskedPhone: "", role: "client" as "client" | "admin", recoveredUsd: "", recoveryRate: "", recoveryComplete: false };

type EditMode = "profile" | "assets";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SFUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ ...BLANK_FORM });

  // Edit drawer
  const [editUser, setEditUser] = useState<SFUser | null>(null);
  const [editMode, setEditMode] = useState<EditMode>("profile");
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", maskedPhone: "", role: "client" as "client" | "admin", recoveredUsd: "", recoveryRate: "", recoveryComplete: false });
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const refresh = useCallback(() => {
    getAdminUsers().then((d) => setUsers(d.users)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openEdit = async (u: SFUser) => {
    setEditUser(u);
    setEditMode("profile");
    setEditForm({ name: u.name, email: u.email, password: "", maskedPhone: u.maskedPhone ?? "", role: u.role, recoveredUsd: String(u.recoveredUsd), recoveryRate: String(u.recoveryRate), recoveryComplete: u.recoveryComplete });
    setAssetsLoading(true);
    try {
      const res = await getAdminUserAssets(u.id);
      setAssets(res.assets);
    } catch { setAssets([]); }
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
      const patch: Record<string, unknown> = { name: editForm.name, email: editForm.email, maskedPhone: editForm.maskedPhone, role: editForm.role, recoveredUsd: Number(editForm.recoveredUsd) || 0, recoveryRate: Number(editForm.recoveryRate) || 0, recoveryComplete: editForm.recoveryComplete };
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
  };

  const updateAssetAmount = (symbol: string, amount: number) => {
    setAssets(assets.map((a) => a.symbol === symbol ? { ...a, amount, usd: +(amount * a.usdRate).toFixed(2) } : a));
  };

  const removeAsset = (symbol: string) => setAssets(assets.filter((a) => a.symbol !== symbol));

  const Spinner = () => (
    <span className="h-4 w-4 border-2 rounded-full animate-spin inline-block" style={{ borderColor: "var(--accent-teal)", borderTopColor: "transparent" }} />
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      {loading ? (
        <div className="flex items-center justify-center h-40"><Spinner /></div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: "var(--glass-border)" }}>
            <p className="text-sm font-semibold text-white">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--glass-border)" }}>
            {users.map((u) => {
              const initials = u.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={u.id} className="flex items-center gap-3 p-4">
                  <span className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: u.role === "admin" ? "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))" : "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#04060d", opacity: u.blocked ? 0.4 : 1 }}>
                    {initials}
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
                    <p className="text-xs text-white/30 sm:hidden" style={{ fontFamily: "var(--font-mono)" }}>{u.caseId}</p>
                  </div>
                  <div className="text-right hidden sm:block shrink-0">
                    <p className="text-xs text-white/50" style={{ fontFamily: "var(--font-mono)" }}>{u.caseId}</p>
                    <p className="text-xs text-white/30">Since {u.clientSince}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--accent-emerald)" }}>${u.recoveredUsd.toLocaleString()}</p>
                    <p className="text-xs text-white/30">{u.recoveryRate}%</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(u)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80" style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent-teal)" }}>Edit</button>
                    <button onClick={() => handleBlock(u)} disabled={saving} className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80" style={{ background: u.blocked ? "rgba(0,255,136,0.1)" : "rgba(239,68,68,0.1)", color: u.blocked ? "var(--accent-emerald)" : "#f87171" }}>
                      {u.blocked ? "Unblock" : "Block"}
                    </button>
                  </div>
                </div>
              );
            })}
            {users.length === 0 && <p className="text-sm text-white/30 text-center py-10">No users found.</p>}
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
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{editUser.name}</h2>
                <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>{editUser.caseId}</p>
              </div>
              <button onClick={() => setEditUser(null)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
              {(["profile", "assets"] as EditMode[]).map((m) => (
                <button key={m} onClick={() => setEditMode(m)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all" style={{ background: editMode === m ? "rgba(0,212,255,0.15)" : "transparent", color: editMode === m ? "var(--accent-teal)" : "rgba(255,255,255,0.4)" }}>
                  {m}
                </button>
              ))}
            </div>

            {error && <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

            {editMode === "profile" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Full Name</label>
                    <input className="sf-input w-full" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Email</label>
                    <input className="sf-input w-full" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">New Password</label>
                    <input className="sf-input w-full" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder="Leave blank to keep" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Phone (masked)</label>
                    <input className="sf-input w-full" value={editForm.maskedPhone} onChange={(e) => setEditForm({ ...editForm, maskedPhone: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Role</label>
                    <select className="sf-input w-full" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as "client" | "admin" })}>
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Recovered USD</label>
                    <input className="sf-input w-full" type="number" min="0" value={editForm.recoveredUsd} onChange={(e) => setEditForm({ ...editForm, recoveredUsd: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Recovery Rate %</label>
                    <input className="sf-input w-full" type="number" min="0" max="100" value={editForm.recoveryRate} onChange={(e) => setEditForm({ ...editForm, recoveryRate: e.target.value })} />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.recoveryComplete} onChange={(e) => setEditForm({ ...editForm, recoveryComplete: e.target.checked })} className="rounded" />
                  <span className="text-sm text-white/60">Recovery Complete</span>
                </label>
              </div>
            )}

            {editMode === "assets" && (
              <div className="space-y-4">
                {assetsLoading ? (
                  <div className="flex justify-center py-6"><Spinner /></div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {assets.map((a) => (
                        <div key={a.symbol} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <span className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: a.color + "20", color: a.color }}>{a.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">{a.symbol}</p>
                            <p className="text-xs text-white/30">${(a.amount * a.usdRate).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</p>
                          </div>
                          <input type="number" min="0" step="any" value={a.amount} onChange={(e) => updateAssetAmount(a.symbol, parseFloat(e.target.value) || 0)}
                            className="sf-input w-28 text-right text-sm" />
                          <button onClick={() => removeAsset(a.symbol)} className="text-white/30 hover:text-red-400 text-lg leading-none ml-1">×</button>
                        </div>
                      ))}
                      {assets.length === 0 && <p className="text-xs text-white/30 text-center py-4">No assets. Add one below.</p>}
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-2">Add asset</p>
                      <div className="flex flex-wrap gap-2">
                        {ASSET_PRESETS.filter((p) => !assets.find((a) => a.symbol === p.symbol)).map((p) => (
                          <button key={p.symbol} onClick={() => addAsset(p.symbol)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80" style={{ background: p.color + "20", color: p.color }}>
                            + {p.symbol}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl text-sm font-semibold" style={{ background: "rgba(0,255,136,0.06)", color: "var(--accent-emerald)" }}>
                      Total: ${assets.reduce((s, a) => s + a.usd, 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white border transition-colors" style={{ borderColor: "var(--glass-border)" }}>Cancel</button>
              <button onClick={editMode === "profile" ? handleEditSave : handleAssetsSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-80" style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))", color: "#04060d" }}>
                {saving ? <Spinner /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
