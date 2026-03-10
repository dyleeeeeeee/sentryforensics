"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({ email: true, sms: true, app: false });
  const [privacy, setPrivacy] = useState({ twoFactor: true, biometric: false, sessionLock: true });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className="relative h-6 w-11 rounded-full transition-all duration-300"
      style={{ background: value ? "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))" : "var(--glass-2)", border: "1px solid var(--glass-border)" }}>
      <span className="absolute top-0.5 rounded-full h-5 w-5 bg-white shadow transition-all duration-300"
        style={{ left: value ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }}/>
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>BANKING PORTAL</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Settings</h1>
      </div>

      {/* Profile */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold"
            style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-violet))", color: "#04060d" }}>
            AC
          </div>
          <div>
            <p className="font-semibold text-white">Alexander Chen</p>
            <p className="text-sm text-white/40">alexander.chen@example.com</p>
            <p className="text-xs text-white/25 mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>Client since Feb 2026</p>
          </div>
          <button className="ml-auto text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)" }}>
            Edit Profile
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[["Full Name", "Alexander Chen"], ["Email", "alexander.chen@example.com"], ["Phone", "+44 •••• •• 7823"], ["Case #", "SF-2024-0847"]].map(([label, val]) => (
            <div key={label}>
              <label className="block text-xs text-white/35 mb-1.5">{label}</label>
              <input className="sf-input text-sm" defaultValue={val} readOnly={label === "Case #"}/>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Security</h2>
        {[
          { label: "Two-Factor Authentication", desc: "SMS verification on every login", key: "twoFactor" as const },
          { label: "Biometric Login", desc: "Use fingerprint or Face ID", key: "biometric" as const },
          { label: "Auto Session Lock", desc: "Lock after 15 minutes of inactivity", key: "sessionLock" as const },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            <div>
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-white/35 mt-0.5">{item.desc}</p>
            </div>
            <Toggle value={privacy[item.key]} onChange={v => setPrivacy(p => ({ ...p, [item.key]: v }))}/>
          </div>
        ))}
        <button className="text-sm px-4 py-2 rounded-lg transition-all"
          style={{ background: "rgba(255,68,102,0.08)", border: "1px solid rgba(255,68,102,0.15)", color: "#ff6680" }}>
          Change Password
        </button>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Notifications</h2>
        {[
          { label: "Email Alerts", desc: "Transaction confirmations and security alerts", key: "email" as const },
          { label: "SMS Notifications", desc: "Critical alerts sent to your phone", key: "sms" as const },
          { label: "Push Notifications", desc: "Real-time alerts via mobile app", key: "app" as const },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            <div>
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-white/35 mt-0.5">{item.desc}</p>
            </div>
            <Toggle value={notifications[item.key]} onChange={v => setNotifications(n => ({ ...n, [item.key]: v }))}/>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,68,102,0.04)", border: "1px solid rgba(255,68,102,0.12)" }}>
        <h2 className="font-semibold mb-3" style={{ color: "#ff6680" }}>Danger Zone</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-4 py-2 rounded-lg text-sm transition-all" style={{ background: "rgba(255,68,102,0.08)", border: "1px solid rgba(255,68,102,0.2)", color: "#ff6680" }}>
            Suspend Account
          </button>
          <button className="px-4 py-2 rounded-lg text-sm transition-all" style={{ background: "rgba(255,68,102,0.08)", border: "1px solid rgba(255,68,102,0.2)", color: "#ff6680" }}>
            Close Portal Access
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
          style={{ background: saved ? "var(--accent-emerald-dim)" : "linear-gradient(135deg, #f59e0b, #fcd34d)", color: saved ? "var(--accent-emerald)" : "#1a0f00" }}>
          {saved ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>Saved</>
          ) : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
