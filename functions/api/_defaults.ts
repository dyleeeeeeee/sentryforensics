import type { User, Asset, Transaction, Account, LinkedBank, Card, TimelineEvent, EvidenceFile, ProfileSettings } from "./_types";

export function defaultUsers(): User[] {
  return [
    {
      id: "u1",
      name: "Alexander Chen",
      email: "alexander.chen@example.com",
      password: "password",
      caseId: "SF-2024-0847",
      maskedPhone: "+44\u20225\u2022\u20227823",
      role: "client",
      recoveredUsd: 295800,
      recoveryRate: 96.2,
      recoveryComplete: true,
      clientSince: "Feb 2026",
    },
    {
      id: "u2",
      name: "Admin User",
      email: "admin@sentryforensics.com",
      password: "admin1234",
      caseId: "SF-ADMIN-001",
      maskedPhone: "+1\u2022\u2022\u20221000",
      role: "admin",
      recoveredUsd: 0,
      recoveryRate: 0,
      recoveryComplete: false,
      clientSince: "Jan 2024",
    },
  ];
}

export function defaultAssets(): Asset[] {
  return [
    { symbol: "BTC", name: "Bitcoin", amount: 3.42, usd: 207842, usdRate: 60772, change: 2.34, color: "#f59e0b", icon: "₿" },
    { symbol: "ETH", name: "Ethereum", amount: 15.8, usd: 47556, usdRate: 3010, change: -0.87, color: "#9d6fff", icon: "Ξ" },
    { symbol: "USDC", name: "USD Coin", amount: 28420, usd: 28420, usdRate: 1, change: 0.01, color: "#00d4ff", icon: "$" },
    { symbol: "SOL", name: "Solana", amount: 92.4, usd: 11982, usdRate: 130, change: 5.12, color: "#00f0a0", icon: "◎" },
  ];
}

export function defaultTransactions(): Transaction[] {
  return [
    { id: "t001", type: "Recovery Credit", asset: "BTC", amount: "+3.42 BTC", usd: 207842, date: "Mar 8, 2026", status: "complete", category: "recovery", dir: "in" },
    { id: "t002", type: "Recovery Credit", asset: "ETH", amount: "+15.8 ETH", usd: 47556, date: "Mar 8, 2026", status: "complete", category: "recovery", dir: "in" },
    { id: "t003", type: "Recovery Credit", asset: "USDC", amount: "+28,420 USDC", usd: 28420, date: "Mar 8, 2026", status: "complete", category: "recovery", dir: "in" },
    { id: "t004", type: "Recovery Credit", asset: "SOL", amount: "+92.4 SOL", usd: 11982, date: "Mar 8, 2026", status: "complete", category: "recovery", dir: "in" },
    { id: "t005", type: "Forensics Service Fee", asset: "USD", amount: "-$12,400", usd: -12400, date: "Mar 9, 2026", status: "complete", category: "fee", dir: "out" },
    { id: "t006", type: "Yield Interest", asset: "USDC", amount: "+142 USDC", usd: 142, date: "Mar 10, 2026", status: "pending", category: "yield", dir: "in" },
    { id: "t007", type: "Withdrawal Request", asset: "USDC", amount: "-5,000 USDC", usd: -5000, date: "Mar 10, 2026", status: "processing", category: "transfer", dir: "out" },
    { id: "t008", type: "Conversion BTC→USDC", asset: "BTC", amount: "-0.1 BTC", usd: -6080, date: "Mar 9, 2026", status: "complete", category: "exchange", dir: "out" },
    { id: "t009", type: "Conversion BTC→USDC", asset: "USDC", amount: "+6,050 USDC", usd: 6050, date: "Mar 9, 2026", status: "complete", category: "exchange", dir: "in" },
  ];
}

export function defaultAccounts(): Account[] {
  return [
    {
      id: "acc1", name: "Recovery Vault", type: "Recovery Account", status: "active",
      balance: 295800,
      assets: [
        { symbol: "BTC", amount: 3.42, usd: 207842, color: "#f59e0b" },
        { symbol: "ETH", amount: 15.8, usd: 47556, color: "#9d6fff" },
        { symbol: "USDC", amount: 28420, usd: 28420, color: "#00d4ff" },
        { symbol: "SOL", amount: 92.4, usd: 11982, color: "#00f0a0" },
      ],
      opened: "Mar 8, 2026", case: "SF-2024-0847",
    },
    {
      id: "acc2", name: "Yield Account", type: "Interest-Bearing", status: "active",
      balance: 5142,
      assets: [{ symbol: "USDC", amount: 5142, usd: 5142, color: "#00d4ff" }],
      opened: "Mar 10, 2026", case: "—",
    },
  ];
}

export function defaultLinkedBanks(): LinkedBank[] {
  return [
    { id: "b1", name: "Chase Bank", number: "••••3847", type: "Checking", verified: true, country: "🇺🇸" },
    { id: "b2", name: "Barclays", number: "••••9921", type: "Current Account", verified: true, country: "🇬🇧" },
  ];
}

export function defaultCards(): Card[] {
  return [
    {
      id: "c1", name: "Recovery VISA", number: "4847 •••• •••• 7291", expiry: "03/28",
      holder: "Alexander Chen", limit: 10000, spent: 1240, status: "active", frozen: false,
      gradient: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 50%, #0d1117 100%)",
      accent: "#00d4ff",
    },
    {
      id: "c2", name: "Sentry Gold MC", number: "5234 •••• •••• 4419", expiry: "09/27",
      holder: "Alexander Chen", limit: 25000, spent: 0, status: "active", frozen: false,
      gradient: "linear-gradient(135deg, #1a0f00 0%, #2d1a00 50%, #1a0f00 100%)",
      accent: "#f59e0b",
    },
  ];
}

export function defaultTimeline(): TimelineEvent[] {
  return [
    { date: "Feb 3, 2026", time: "14:22 UTC", event: "Case Opened", detail: "Intake form submitted via secure portal. Case SF-2024-0847 assigned.", status: "done", icon: "📋" },
    { date: "Feb 4, 2026", time: "09:15 UTC", event: "Initial Assessment", detail: "Forensic team reviewed submitted transaction hashes and wallet addresses. Attack vector identified as phishing-based credential theft.", status: "done", icon: "🔍" },
    { date: "Feb 10, 2026", time: "11:00 UTC", event: "Blockchain Tracing", detail: "Deep chain analysis across 3 networks. 18 hop trail followed across mixing services. Associated wallet clusters identified.", status: "done", icon: "⛓" },
    { date: "Feb 22, 2026", time: "16:40 UTC", event: "Attribution Report", detail: "Attack attributed to known threat actor cluster. Full dossier prepared. Law enforcement liaison completed.", status: "done", icon: "📊" },
    { date: "Mar 1, 2026", time: "10:00 UTC", event: "Legal Recovery Motion", detail: "Assets flagged for recovery via exchange cooperation agreement. Freeze order executed on 4 exchange accounts.", status: "done", icon: "⚖️" },
    { date: "Mar 8, 2026", time: "08:00 UTC", event: "Funds Recovered", detail: "3.42 BTC + 15.8 ETH + 28,420 USDC + 92.4 SOL successfully credited to recovery vault. 96.2% recovery rate achieved.", status: "done", icon: "✅" },
    { date: "Mar 10, 2026", time: "Ongoing", event: "Continued Monitoring", detail: "Threat actor wallet activity monitored for potential remaining assets. Quarterly reports scheduled.", status: "active", icon: "👁" },
  ];
}

export function defaultEvidence(): EvidenceFile[] {
  return [
    { name: "Forensic Analysis Report", type: "PDF", size: "4.2 MB", date: "Feb 22, 2026" },
    { name: "Blockchain Trace Map", type: "PDF", size: "8.7 MB", date: "Feb 10, 2026" },
    { name: "Attribution Dossier (Redacted)", type: "PDF", size: "2.1 MB", date: "Feb 22, 2026" },
    { name: "Recovery Confirmation", type: "PDF", size: "0.8 MB", date: "Mar 8, 2026" },
  ];
}

export function defaultProfileSettings(user: User): ProfileSettings {
  return {
    name: user.name,
    email: user.email,
    phone: user.maskedPhone,
    notifications: { email: true, sms: true, app: false },
    privacy: { twoFactor: true, biometric: false, sessionLock: true },
  };
}
