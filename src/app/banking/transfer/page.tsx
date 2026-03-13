"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getDashboard, submitTransfer, type Asset } from "@/lib/api";

type Step = "select" | "amount" | "review" | "confirm" | "done";

type Destination = { id: string; type: string; label: string; flag: string };

const DESTINATIONS: Destination[] = [
  { id: "bank1", type: "bank", label: "Chase Bank ••••3847", flag: "🏦" },
  { id: "bank2", type: "bank", label: "Barclays ••••9921", flag: "🏦" },
  { id: "wallet1", type: "wallet", label: "Ledger Wallet (BTC)", flag: "🔐" },
  { id: "wallet2", type: "wallet", label: "MetaMask (ETH)", flag: "🦊" },
];

export default function TransferPage() {
  const [step, setStep] = useState<Step>("select");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [destination, setDestination] = useState<Destination>(DESTINATIONS[0]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txRef, setTxRef] = useState("");

  useEffect(() => {
    getDashboard().then(d => {
      setAssets(d.assets);
      if (d.assets.length > 0) setSelectedAsset(d.assets.find(a => a.symbol === "USDC") ?? d.assets[0]);
    }).catch(console.error);
  }, []);

  const usdAmount = parseFloat(amount || "0") * (selectedAsset?.usdRate ?? 1);
  const fee = usdAmount * 0.005;
  const receive = usdAmount - fee;

  const steps: Step[] = ["select", "amount", "review", "confirm", "done"];
  const stepIdx = steps.indexOf(step);

  const handleNext = async () => {
    if (step === "review") {
      if (!selectedAsset) return;
      setLoading(true);
      setError("");
      try {
        const result = await submitTransfer({
          asset: selectedAsset.symbol,
          amount: parseFloat(amount),
          destinationId: destination.id,
          destinationLabel: destination.label,
        });
        setTxRef(result.ref);
        setStep("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Transfer failed");
      } finally {
        setLoading(false);
      }
      return;
    }
    const next = steps[stepIdx + 1];
    if (next) setStep(next as Step);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>BANKING PORTAL</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Transfer Funds</h1>
      </div>

      {step !== "done" && (
        /* Step indicator */
        <div className="flex items-center gap-0">
          {["Asset", "Amount", "Review", "Confirm"].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: i < stepIdx ? "var(--accent-teal-dim)" : i === stepIdx ? "linear-gradient(135deg, #00d4ff, #9d6fff)" : "var(--glass-1)",
                    border: `1px solid ${i <= stepIdx ? "rgba(0,212,255,0.3)" : "var(--glass-border)"}`,
                    color: i < stepIdx ? "var(--accent-teal)" : i === stepIdx ? "#fff" : "var(--fg-tertiary)",
                    fontFamily: "var(--font-mono)",
                  }}>
                  {i < stepIdx ? "✓" : i + 1}
                </div>
                <span className="text-[10px] mt-1 text-white/30 text-center" style={{ fontFamily: "var(--font-mono)" }}>{s}</span>
              </div>
              {i < 3 && <div className="flex-1 h-px mx-2 mt-[-14px]" style={{ background: i < stepIdx ? "var(--accent-teal)" : "var(--glass-border)" }}/>}
            </div>
          ))}
        </div>
      )}

      <div className="glass-card rounded-2xl p-6">

        {step === "select" && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-white/40 mb-3 tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>SELECT ASSET TO TRANSFER</p>
              <div className="space-y-2">
                {assets.map(a => (
                  <button key={a.symbol} onClick={() => setSelectedAsset(a)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                    style={{
                      background: selectedAsset?.symbol === a.symbol ? `${a.color}12` : "var(--glass-1)",
                      border: `1px solid ${selectedAsset?.symbol === a.symbol ? `${a.color}30` : "var(--glass-border)"}`,
                    }}>
                    <span className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{ background: `${a.color}18`, color: a.color, fontFamily: "var(--font-mono)" }}>{a.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{a.name}</p>
                      <p className="text-xs text-white/40">{a.amount} {a.symbol} available</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">${(a.amount * a.usdRate).toLocaleString()}</p>
                      <p className="text-xs text-white/35">≈ USD</p>
                    </div>
                    {selectedAsset?.symbol === a.symbol && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/40 mb-3 tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>DESTINATION</p>
              <div className="space-y-2">
                {DESTINATIONS.map(d => (
                  <button key={d.id} onClick={() => setDestination(d)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
                    style={{
                      background: destination.id === d.id ? "var(--accent-teal-dim)" : "var(--glass-1)",
                      border: `1px solid ${destination.id === d.id ? "rgba(0,212,255,0.25)" : "var(--glass-border)"}`,
                    }}>
                    <span className="text-lg">{d.flag}</span>
                    <p className="text-sm font-medium text-white">{d.label}</p>
                    {destination.id === d.id && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2.5" strokeLinecap="round" className="ml-auto">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    )}
                  </button>
                ))}
                <button className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left"
                  style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)", color: "var(--fg-tertiary)" }}>
                  <span className="text-lg">+</span>
                  <p className="text-sm">Add new destination</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "amount" && selectedAsset && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-white/40 mb-3 tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>ENTER AMOUNT</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-white/30"
                  style={{ fontFamily: "var(--font-mono)", color: selectedAsset.color }}>
                  {selectedAsset.icon}
                </span>
                <input type="number" className="sf-input text-2xl font-bold pl-12 py-5"
                  style={{ fontFamily: "var(--font-display)", fontSize: "24px" }}
                  placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}/>
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/35">
                <span>≈ ${usdAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                <button onClick={() => setAmount(String(selectedAsset.amount))} className="text-white/55 hover:text-white transition-colors">
                  Max: {selectedAsset.amount} {selectedAsset.symbol}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map(pct => (
                <button key={pct} onClick={() => setAmount(String((selectedAsset.amount * pct) / 100))}
                  className="py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)", fontFamily: "var(--font-mono)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--glass-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--glass-1)")}>
                  {pct}%
                </button>
              ))}
            </div>
            <div className="space-y-2 p-4 rounded-xl" style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}>
              {[
                ["Network fee (0.5%)", `$${fee.toFixed(2)}`],
                ["You will receive", `$${receive.toFixed(2)}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-white/45">{label}</span>
                  <span className="font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "review" && selectedAsset && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-white/40 mb-3 tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>REVIEW TRANSFER</p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
              {[
                ["From", `${amount} ${selectedAsset.symbol} (≈ $${usdAmount.toFixed(2)})`],
                ["To", destination.label],
                ["Network Fee", `$${fee.toFixed(2)} (0.5%)`],
                ["You Receive", `$${receive.toFixed(2)}`],
                ["Est. Arrival", "1–3 business days"],
              ].map(([label, val], i, arr) => (
                <div key={label} className="flex justify-between px-4 py-3"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--glass-border)" : "none" }}>
                  <span className="text-sm text-white/45">{label}</span>
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-mono)", maxWidth: "60%", textAlign: "right" }}>{val}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-300)" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="text-xs text-white/50 leading-5">Once confirmed, this transfer cannot be reversed. Please verify all details before proceeding.</p>
            </div>
          </div>
        )}

        {step !== "done" && (
          <div className="flex gap-3 mt-6">
            {stepIdx > 0 && (
              <button onClick={() => setStep(steps[stepIdx - 1] as Step)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)" }}>
                Back
              </button>
            )}
            <button onClick={handleNext} disabled={step === "amount" && !amount}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#1a0f00" }}>
              {loading ? (
                <><span className="h-4 w-4 border-2 border-[#1a0f00] border-t-transparent rounded-full animate-spin"/>Processing...</>
              ) : step === "review" ? "Confirm Transfer" : "Continue"}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-4"
              style={{ background: "var(--accent-emerald-dim)", border: "1px solid rgba(0,240,160,0.2)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Transfer Initiated</h2>
            <p className="text-sm text-white/45 mb-2">${receive.toFixed(2)} will arrive in 1–3 business days</p>
            <p className="text-xs text-white/25 mb-6" style={{ fontFamily: "var(--font-mono)" }}>REF: TXN-{Date.now().toString(36).toUpperCase()}</p>
            <div className="flex gap-3 justify-center">
              <Link href="/banking/transactions" className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--glass-2)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)" }}>
                View Transactions
              </Link>
              <button onClick={() => { setStep("select"); setAmount(""); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#1a0f00" }}>
                New Transfer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
