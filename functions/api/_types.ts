/// <reference types="@cloudflare/workers-types" />

export interface Env {
  SENTRY_KV: KVNamespace;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  caseId: string;
  maskedPhone: string;
  role: "client" | "admin";
  recoveredUsd: number;
  recoveryRate: number;
  recoveryComplete: boolean;
  clientSince: string;
  blocked?: boolean;
  openedDate?: string;
  closedDate?: string;
  originalClaim?: number;
  recoveryDays?: number;
  networksTraced?: number;
  withdrawalOtp?: string;
}

export interface Session {
  userId: string;
  role: "client" | "admin";
  createdAt: number;
}

export interface Asset {
  symbol: string;
  name: string;
  amount: number;
  usd: number;
  usdRate: number;
  change: number;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: string;
  asset: string;
  amount: string;
  usd: number;
  date: string;
  status: "complete" | "pending" | "processing" | "failed";
  category: "recovery" | "transfer" | "yield" | "fee" | "exchange";
  dir: "in" | "out";
}

export interface Account {
  id: string;
  name: string;
  type: string;
  status: string;
  balance: number;
  assets: { symbol: string; amount: number; usd: number; color: string }[];
  opened: string;
  case: string;
}

export interface LinkedBank {
  id: string;
  name: string;
  number: string;
  type: string;
  verified: boolean;
  country: string;
}

export interface Card {
  id: string;
  name: string;
  number: string;
  expiry: string;
  holder: string;
  limit: number;
  spent: number;
  status: string;
  frozen: boolean;
  gradient: string;
  accent: string;
}

export interface TimelineEvent {
  date: string;
  time: string;
  event: string;
  detail: string;
  status: "done" | "active" | "pending";
  icon: string;
}

export interface EvidenceFile {
  name: string;
  type: string;
  size: string;
  date: string;
}

export interface IntakeSubmission {
  id: string;
  submittedAt: string;
  fullName: string;
  email: string;
  password?: string;
  contactChannel: string;
  incidentType: string;
  incidentDate: string;
  narrative: string;
  publicAddresses: string;
  txids: string;
  exchangeTicketIds: string;
  lossEstimate: string;
  status: "new" | "reviewing" | "in_progress" | "closed";
}

export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  caseId?: string;
  clientSince?: string;
  initials?: string;
  notifications: { email: boolean; sms: boolean; app: boolean };
  privacy: { twoFactor: boolean; biometric: boolean; sessionLock: boolean };
}
