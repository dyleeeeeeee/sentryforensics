"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getDashboard, getAccounts, submitTransfer, type Asset, type LinkedBank } from "@/lib/api";

type Step = "asset" | "destination" | "amount" | "review" | "done";
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

const STEP_LABELS = ["Asset", "Destination", "Amount", "Review"];

export default function TransferPage() {
  const router_steps: Step[] = ["asset", "destination", "amount", "review", "done"];

  const [step, setStep] = useState<Step>("asset");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [linkedBanks, setLinkedBanks] = useState<LinkedBank[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Asset
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Destination
  const [destType, setDestType] = useState<DestType>("bank");
  const [selectedBank, setSelectedBank] = useState<LinkedBank | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletNetwork, setWalletNetwork] = useState("");
  const [walletAddressTouched, setWalletAddressTouched] = useState(false);

  // Amount
  const [amount, setAmount] = useState("");

  // Submit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txRef, setTxRef] = useState("");
  const [receiveAmt, setReceiveAmt] = useState(0);

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getAccounts(),
    ]).then(([dash, accs]) => {
      setAssets(dash.assets);
      if (dash.assets.length > 0) {
        const def = dash.assets.find(a => a.symbol === "USDC") ?? dash.assets[0];
        setSelectedAsset(def);
        setWalletNetwork(networksFor(def.symbol)[0]);
      }
      setLinkedBanks(accs.linkedBanks);
      if (accs.linkedBanks.length > 0) setSelectedBank(accs.linkedBanks[0]);
    }).catch(console.error).finally(() => setLoadingData(false));
  }, []);

  const usdAmount = parseFloat(amount || "0") * (selectedAsset?.usdRate ?? 1);
  const fee = usdAmount * 0.005;
  const receive = usdAmount - fee;

  const stepIdx = router_steps.indexOf(step);

  const destinationLabel =
    destType === "bank"
      ? selectedBank ? `${selectedBank.name} ${selectedBank.number}` : ""
      : walletAddress
        ? `${walletNetwork} — ${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`
        : "";

  const destinationId =
    destType === "bank" ? (selectedBank?.id ?? "") : `wallet:${walletAddress}`;

  const walletValid = walletAddress.trim().length >= 26;
  const canProceedDestination =
    destType === "bank" ? !!selectedBank : walletValid;

  const canProceedAmount = !!amount && parseFloat(amount) > 0 && parseFloat(amount) <= (selectedAsset?.amount ?? 0);

  function goNext() {
    if (step === "asset" && selectedAsset) {
      setWalletNetwork(networksFor(selectedAsset.symbol)[0]);
      setStep("destination");
    } else if (step === "destination" && canProceedDestination) {
      setStep("amount");
    } else if (step === "amount" && canProceedAmount) {
      setStep("review");
    } else if (step === "review") {
      handleSubmit();
    }
  }

  function goBack() {
    if (step === "destination") setStep("asset");
    else if (step === "amount") setStep("destination");
    else if (step === "review") setStep("amount");
  }

  async function handleSubmit() {
    if (!selectedAsset || !destinationId) return;
    setLoading(true);
    setError("");
    try {
      const result = await submitTransfer({
        asset: selectedAsset.symbol,
        amount: parseFloat(amount),
        destinationId,
        destinationLabel: destType === "bank"
          ? destinationLabel
          : `${walletNetwork} — ${walletAddress}`,
      });
      setTxRef(result.ref);
      setReceiveAmt(result.receiveUsd);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) return (
    <div className="flex items-center justify-center h-64">
      <span className="h-8 w-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--accent-teal)", borderTopColor: "transparent" }}/>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>BANKING PORTAL</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Withdraw Funds</h1>
      </div>

      {step !== "done" && (
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

            {/* Type toggle */}
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

            {/* Bank selection */}
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

            {/* Crypto wallet */}
            {destType === "crypto" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Network</label>
                  <select
                    value={walletNetwork}
                    onChange={e => setWalletNetwork(e.target.value)}
                    className="sf-input"
                    style={{ background: "var(--glass-1)" }}>
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl"
                  style={{ fontFamily: "var(--font-mono)", color: selectedAsset.color }}>
                  {selectedAsset.icon}
                </span>
                <input type="number" className="sf-input pl-11 py-4 text-xl font-bold"
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
            <div className="rounded-xl overflow-hidden divide-y" style={{ border: "1px solid var(--glass-border)", borderColor: "var(--glass-border)" }}>
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
                <div key={label} className="flex justify-between px-4 py-3">
                  <span className="text-sm text-white/45">{label}</span>
                  <span className="text-sm font-semibold text-white text-right ml-4 break-all" style={{ fontFamily: "var(--font-mono)", maxWidth: "55%" }}>{val}</span>
                </div>
              ))}
            </div>

            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="text-xs text-white/50 leading-5">Once confirmed, this withdrawal cannot be reversed. Double-check {destType === "crypto" ? "your wallet address and network" : "your bank account details"} before proceeding.</p>
            </div>
          </>
        )}

        {/* ── Done ── */}
        {step === "done" && (
          <div className="text-center py-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-4"
              style={{ background: "var(--accent-emerald-dim)", border: "1px solid rgba(0,240,160,0.2)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Withdrawal Submitted</h2>
            <p className="text-sm text-white/45 mb-1">
              {destType === "bank" ? `$${receiveAmt.toFixed(2)} will arrive in 1–3 business days` : `Your ${selectedAsset?.symbol} is on its way — est. 10–60 min`}
            </p>
            <p className="text-xs text-white/25 mb-6" style={{ fontFamily: "var(--font-mono)" }}>REF: {txRef.toUpperCase()}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/banking/transactions" className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--glass-2)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)" }}>
                View Transactions
              </Link>
              <button onClick={() => { setStep("asset"); setAmount(""); setWalletAddress(""); setWalletAddressTouched(false); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#1a0f00" }}>
                New Withdrawal
              </button>
            </div>
          </div>
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
                (step === "amount" && !canProceedAmount) ||
                loading
              }
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #f59e0b, #fcd34d)", color: "#1a0f00" }}>
              {loading
                ? <><span className="h-4 w-4 border-2 border-[#1a0f00] border-t-transparent rounded-full animate-spin"/>Processing…</>
                : step === "review" ? "Confirm Withdrawal" : "Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
