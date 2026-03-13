"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { submitIntake } from "@/lib/api";

type StepId = "safety" | "contact" | "incident" | "evidence" | "review" | "done";

type FormState = {
  fullName: string;
  email: string;
  password: string;
  contactChannel: "email" | "telegram" | "signal";
  incidentType: "scam" | "phishing" | "exchange" | "lost_access" | "other";
  incidentDate: string;
  narrative: string;
  publicAddresses: string;
  txids: string;
  exchangeTicketIds: string;
  lossEstimate: string;
  consent: boolean;
  honeypot: string;
};

const initialState: FormState = {
  fullName: "",
  email: "",
  password: "",
  contactChannel: "email",
  incidentType: "scam",
  incidentDate: "",
  narrative: "",
  publicAddresses: "",
  txids: "",
  exchangeTicketIds: "",
  lossEstimate: "",
  consent: false,
  honeypot: "",
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function clampText(value: string, max: number) {
  if (value.length <= max) return value;
  return value.slice(0, max);
}

export function IntakeFlow() {
  const [step, setStep] = useState<StepId>("safety");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [caseId, setCaseId] = useState("");

  const steps = useMemo(
    () =>
      [
        { id: "safety" as const, label: "Safety" },
        { id: "contact" as const, label: "Contact" },
        { id: "incident" as const, label: "Incident" },
        { id: "evidence" as const, label: "Evidence" },
        { id: "review" as const, label: "Review" },
      ],
    []
  );

  const activeIndex = steps.findIndex((s) => s.id === step);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (form.honeypot.trim().length > 0) {
      e.honeypot = "Invalid submission.";
    }

    if (step === "contact" || step === "review") {
      if (!form.fullName.trim()) e.fullName = "Full name is required.";
      if (!form.email.trim()) e.email = "Email is required.";
      else if (!isEmail(form.email)) e.email = "Enter a valid email.";
      if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters.";
    }

    if (step === "incident" || step === "review") {
      if (form.narrative.trim().length < 40) {
        e.narrative = "Please provide a brief operational summary (~40+ characters).";
      }
    }

    if (step === "safety") {
      if (!form.consent) e.consent = "Confirmation required to proceed.";
    }

    return e;
  }, [form, step]);

  const canGoNext = useMemo(() => {
    if (step === "safety") return !errors.consent && !errors.honeypot;
    if (step === "contact") return !errors.fullName && !errors.email && !errors.password && !errors.honeypot;
    if (step === "incident") return !errors.narrative && !errors.honeypot;
    if (step === "evidence") return !errors.honeypot;
    if (step === "review") return Object.keys(errors).length === 0;
    return true;
  }, [errors, step]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function markTouched(keys: (keyof FormState)[]) {
    setTouched((prev) => {
      const next = { ...prev };
      for (const k of keys) next[String(k)] = true;
      return next;
    });
  }

  function goNext() {
    if (step === "safety") {
      markTouched(["consent"]);
      if (!canGoNext) return;
      setStep("contact");
      return;
    }

    if (step === "contact") {
      markTouched(["fullName", "email", "password"]);
      if (!canGoNext) return;
      setStep("incident");
      return;
    }

    if (step === "incident") {
      markTouched(["narrative"]);
      if (!canGoNext) return;
      setStep("evidence");
      return;
    }

    if (step === "evidence") {
      if (!canGoNext) return;
      setStep("review");
      return;
    }

    if (step === "review") {
      markTouched(["fullName", "email", "password", "narrative", "consent"]);
      if (!canGoNext) return;
      setSubmitting(true);
      setSubmitError("");
      submitIntake({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        contactChannel: form.contactChannel,
        incidentType: form.incidentType,
        incidentDate: form.incidentDate,
        narrative: form.narrative,
        publicAddresses: form.publicAddresses,
        txids: form.txids,
        exchangeTicketIds: form.exchangeTicketIds,
        lossEstimate: form.lossEstimate,
        consent: form.consent,
        honeypot: form.honeypot,
      }).then((res) => {
        setCaseId(res.caseId);
        setStep("done");
      }).catch((err: Error) => {
        setSubmitError(err.message ?? "Submission failed. Please try again.");
      }).finally(() => {
        setSubmitting(false);
      });
    }
  }

  function goBack() {
    if (step === "contact") return setStep("safety");
    if (step === "incident") return setStep("contact");
    if (step === "evidence") return setStep("incident");
    if (step === "review") return setStep("evidence");
  }

  const summary = useMemo(() => {
    const lines = [
      `Name: ${form.fullName || "(not provided)"}`,
      `Email: ${form.email || "(not provided)"}`,
      `Preferred contact: ${form.contactChannel}`,
      `Incident type: ${form.incidentType}`,
      `Incident date: ${form.incidentDate || "(not provided)"}`,
      `Loss estimate: ${form.lossEstimate || "(not provided)"}`,
      "",
      "Narrative:",
      clampText(form.narrative.trim() || "(not provided)", 2200),
      "",
      `Public addresses: ${form.publicAddresses.trim() || "(none)"}`,
      `TXIDs: ${form.txids.trim() || "(none)"}`,
      `Exchange ticket IDs: ${form.exchangeTicketIds.trim() || "(none)"}`,
    ];

    return lines.join("\n");
  }, [form]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      // no-op
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Intake workflow</p>
            <p className="mt-1 text-xs text-white/60">
              Complete all steps to submit your case.
            </p>
          </div>
          <p className="text-xs font-medium text-white/60">
            Step {Math.max(1, activeIndex + 1)} of {steps.length}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {steps.map((s, i) => {
            const isActive = s.id === step;
            const isDone = i < activeIndex;
            return (
              <div
                key={s.id}
                className={
                  "h-1.5 rounded-full transition " +
                  (isActive
                    ? "bg-white/60"
                    : isDone
                      ? "bg-white/40"
                      : "bg-white/10")
                }
              />
            );
          })}
        </div>
      </div>

      {step === "safety" ? (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">Safety gate</p>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li>Do not paste seed phrases or private keys.</li>
              <li>Do not upload wallet backup files.</li>
              <li>Public addresses and transaction hashes are OK.</li>
              <li>Do not share remote access credentials.</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-white"
              checked={form.consent}
              onChange={(e) => update("consent", e.target.checked)}
            />
            <span className="text-sm leading-6 text-white/80">
              I confirm I will not share seed phrases, private keys, wallet backups, or remote
              access credentials.
            </span>
          </label>
          {touched.consent && errors.consent ? (
            <p className="text-xs font-medium text-red-200">{errors.consent}</p>
          ) : null}

          <div className="hidden">
            <label className="text-xs text-white/60">
              Leave this field blank
              <input
                value={form.honeypot}
                onChange={(e) => update("honeypot", e.target.value)}
                className="block w-full"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>
        </div>
      ) : null}

      {step === "contact" ? (
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-white/60">Full name</label>
              <input
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                onBlur={() => markTouched(["fullName"])}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                placeholder="Your name"
              />
              {touched.fullName && errors.fullName ? (
                <p className="mt-2 text-xs font-medium text-red-200">{errors.fullName}</p>
              ) : null}
            </div>

            <div>
              <label className="text-xs font-medium text-white/60">Email</label>
              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                onBlur={() => markTouched(["email"])}
                inputMode="email"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                placeholder="name@domain.com"
              />
              {touched.email && errors.email ? (
                <p className="mt-2 text-xs font-medium text-red-200">{errors.email}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/60">Create a portal password</label>
            <p className="text-[11px] text-white/40 mb-2">You will use this to log into the client portal if your case is approved.</p>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              onBlur={() => markTouched(["password"])}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
              placeholder="Min. 8 characters"
            />
            {touched.password && errors.password ? (
              <p className="mt-2 text-xs font-medium text-red-200">{errors.password}</p>
            ) : null}
          </div>

          <div>
            <label className="text-xs font-medium text-white/60">Preferred contact channel</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {([
                { id: "email" as const, label: "Email" },
                { id: "telegram" as const, label: "Telegram" },
                { id: "signal" as const, label: "Signal" },
              ] as const).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => update("contactChannel", c.id)}
                  className={
                    "rounded-2xl border px-4 py-3 text-left text-sm transition-all backdrop-blur-sm " +
                    (form.contactChannel === c.id
                      ? "border-white/25 bg-white/10 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]"
                      : "border-white/10 bg-black/20/70 text-white/80 hover:bg-black/25/80 hover:border-white/20")
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/60">Estimated loss (optional)</label>
            <input
              value={form.lossEstimate}
              onChange={(e) => update("lossEstimate", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
              placeholder="e.g. ~$2,500 USD"
            />
          </div>
        </div>
      ) : null}

      {step === "incident" ? (
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-medium text-white/60">Incident type</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {([
                { id: "scam" as const, label: "Scam / impersonation" },
                { id: "phishing" as const, label: "Phishing / drain" },
                { id: "exchange" as const, label: "Exchange dispute" },
                { id: "lost_access" as const, label: "Lost access" },
                { id: "other" as const, label: "Other" },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update("incidentType", t.id)}
                  className={
                    "rounded-2xl border px-4 py-3 text-left text-sm transition-all backdrop-blur-sm " +
                    (form.incidentType === t.id
                      ? "border-white/25 bg-white/10 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]"
                      : "border-white/10 bg-black/20/70 text-white/80 hover:bg-black/25/80 hover:border-white/20")
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/60">Approximate date (optional)</label>
            <input
              type="date"
              value={form.incidentDate}
              onChange={(e) => update("incidentDate", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20/70 px-4 py-3 text-sm text-white outline-none backdrop-blur-sm transition-all focus:border-white/20 focus:bg-black/25/80 focus:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/60">
              Incident narrative (safe, non-sensitive)
            </label>
            <textarea
              value={form.narrative}
              onChange={(e) => update("narrative", e.target.value)}
              onBlur={() => markTouched(["narrative"])}
              rows={7}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
              placeholder="Share a timeline and what you observed. Do not include seed phrases, private keys, or remote access details."
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-white/55">Minimum detail supports accurate triage.</p>
              <p className="text-xs text-white/55">{form.narrative.trim().length} chars</p>
            </div>
            {touched.narrative && errors.narrative ? (
              <p className="mt-2 text-xs font-medium text-red-200">{errors.narrative}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === "evidence" ? (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">Evidence (optional)</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Include only public identifiers. If unsure, leave these blank.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-white/60">Public addresses (optional)</label>
            <textarea
              value={form.publicAddresses}
              onChange={(e) => update("publicAddresses", e.target.value)}
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
              placeholder="One per line"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/60">Transaction hashes / TXIDs (optional)</label>
            <textarea
              value={form.txids}
              onChange={(e) => update("txids", e.target.value)}
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
              placeholder="One per line"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/60">Exchange ticket IDs (optional)</label>
            <input
              value={form.exchangeTicketIds}
              onChange={(e) => update("exchangeTicketIds", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
              placeholder="e.g. Binance #12345, Coinbase Case 0000"
            />
          </div>
        </div>
      ) : null}

      {step === "review" ? (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">Review</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Confirm your details before submitting.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <pre className="whitespace-pre-wrap break-words text-xs leading-5 text-white/80">
              {summary}
            </pre>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="secondary" onClick={copySummary}>
              Copy summary
            </Button>
            {submitError && (
              <p className="text-xs font-medium text-red-300">{submitError}</p>
            )}
          </div>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Intake submitted</p>
            {caseId && (
              <p className="mt-1 text-xs font-mono text-white/50">Case ID: {caseId}</p>
            )}
            <p className="mt-2 text-sm leading-6 text-white/70">
              Your intake has been securely received. A member of our forensics team will review your case and contact you via your preferred channel.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setForm(initialState);
                setTouched({});
                setStep("safety");
              }}
            >
              Start a new intake
            </Button>
            <Button type="button" variant="ghost" onClick={copySummary}>
              Copy last summary
            </Button>
          </div>
        </div>
      ) : null}

      {step !== "done" ? (
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {step !== "safety" ? (
              <Button type="button" variant="secondary" onClick={goBack}>
                Back
              </Button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="primary" onClick={goNext} disabled={!canGoNext || submitting}>
              {step === "review" ? (submitting ? "Submitting…" : "Submit") : "Continue"}
            </Button>
            {step === "review" ? (
              <Button type="button" variant="ghost" onClick={() => window.open('https://t.me/sentry-support', '_blank')}>
                Chat with live agent
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="text-xs leading-5 text-white/55">
        Disclaimer: Outcomes vary by scenario and evidence. Sentry Forensics does not custody
        funds.
      </p>
    </div>
  );
}
