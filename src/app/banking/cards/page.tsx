"use client";
import { useState, useEffect } from "react";
import { getCards, freezeCard, type Card } from "@/lib/api";

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [showNumber, setShowNumber] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCards().then(d => {
      setCards(d.cards);
      if (d.cards.length > 0) setSelectedCard(d.cards[0].id);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const active = cards.find(c => c.id === selectedCard);

  const toggleFreeze = async () => {
    if (!selectedCard) return;
    try {
      const result = await freezeCard(selectedCard);
      setCards(result.cards);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs tracking-widest text-white/30 mb-1" style={{ fontFamily: "var(--font-mono)" }}>BANKING PORTAL</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Virtual Cards</h1>
      </div>

      {/* Card selector */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {cards.map(card => (
          <button key={card.id} onClick={() => setSelectedCard(card.id)}
            className="relative flex-shrink-0 w-64 h-40 rounded-2xl p-5 text-left transition-all hover:-translate-y-1"
            style={{
              background: card.gradient,
              border: `1px solid ${selectedCard === card.id ? card.accent + "50" : "rgba(255,255,255,0.1)"}`,
              boxShadow: selectedCard === card.id ? `0 20px 50px ${card.accent}22, var(--shadow-xl)` : "var(--shadow-lg)",
              filter: card.frozen ? "saturate(0.3)" : "none",
              opacity: card.frozen ? 0.8 : 1,
            }}>
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${card.accent}60, transparent)` }}/>
              <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full" style={{ background: `${card.accent}08` }}/>
            </div>
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold text-white/60" style={{ fontFamily: "var(--font-mono)" }}>
                {card.name}
              </p>
              {card.frozen && <span className="badge badge-warning" style={{ fontSize: "8px" }}>FROZEN</span>}
            </div>
            <p className="mt-4 text-sm font-semibold text-white/80" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.15em" }}>
              {card.number}
            </p>
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <div>
                <p className="text-[9px] text-white/30" style={{ fontFamily: "var(--font-mono)" }}>VALID THRU</p>
                <p className="text-xs font-semibold text-white/70" style={{ fontFamily: "var(--font-mono)" }}>{card.expiry}</p>
              </div>
              <div className="flex gap-1.5">
                <div className="h-6 w-6 rounded-full" style={{ background: `${card.accent}60` }}/>
                <div className="h-6 w-6 rounded-full -ml-3" style={{ background: `${card.accent}40` }}/>
              </div>
            </div>
          </button>
        ))}
        <button className="flex-shrink-0 w-64 h-40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1"
          style={{ background: "var(--glass-1)", border: "1px dashed var(--glass-border)" }}>
          <span className="text-2xl text-white/20">+</span>
          <p className="text-xs text-white/30">Request New Card</p>
        </button>
      </div>

      {/* Card details */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-white">Card Details</h2>
          <div className="space-y-3">
            {[
              ["Cardholder", active.holder],
              ["Card Number", showNumber ? "4847 2312 8847 7291" : active.number],
              ["Expiry Date", active.expiry],
              ["CVV", showNumber ? "419" : "•••"],
              ["Status", active.frozen ? "Frozen" : "Active"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <span className="text-sm text-white/40">{label}</span>
                <span className="text-sm font-semibold text-white" style={{ fontFamily: label === "Card Number" || label === "CVV" ? "var(--font-mono)" : "inherit" }}>{val}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowNumber(!showNumber)}
            className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)", color: "var(--fg-secondary)", fontFamily: "var(--font-mono)" }}>
            {showNumber ? "HIDE DETAILS" : "REVEAL FULL DETAILS"}
          </button>
        </div>

        <div className="space-y-4">
          {/* Spend limit */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex justify-between mb-3">
              <h2 className="font-semibold text-white">Spending Limit</h2>
              <span className="text-sm font-semibold" style={{ color: active.accent, fontFamily: "var(--font-mono)" }}>
                ${active.spent.toLocaleString()} / ${active.limit.toLocaleString()}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: `${(active.spent / active.limit) * 100}%`,
                background: `linear-gradient(90deg, ${active.accent}, ${active.accent}88)`
              }}/>
            </div>
            <p className="text-xs text-white/35 mt-2">${(active.limit - active.spent).toLocaleString()} remaining this month</p>
          </div>

          {/* Controls */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-semibold text-white mb-4">Card Controls</h2>
            <div className="space-y-2">
              {[
                { label: active.frozen ? "Unfreeze Card" : "Freeze Card", desc: active.frozen ? "Re-enable this card" : "Temporarily disable", action: toggleFreeze, color: active.frozen ? "var(--accent-emerald)" : "#ff6680", icon: "❄" },
                { label: "Set Spending Limit", desc: "Adjust monthly cap", action: () => {}, color: "var(--accent-teal)", icon: "⚙" },
                { label: "Report Lost/Stolen", desc: "Block and replace", action: () => {}, color: "#ff6680", icon: "⚠" },
              ].map(ctrl => (
                <button key={ctrl.label} onClick={ctrl.action}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
                  style={{ background: "var(--glass-1)", border: "1px solid var(--glass-border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--glass-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--glass-1)")}>
                  <span className="text-base">{ctrl.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: ctrl.color }}>{ctrl.label}</p>
                    <p className="text-xs text-white/30">{ctrl.desc}</p>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white/20">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
