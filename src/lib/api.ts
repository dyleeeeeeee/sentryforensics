/**
 * Sentry Forensics – API client
 * All data flows through the Cloudflare Worker at /api/*
 */

const BASE = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sf_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options?.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginResult {
  pendingToken: string;
  maskedPhone: string;
  otpHint?: string;
}

export interface VerifyResult {
  token: string;
  user: SFUser;
}

export interface SFUser {
  id: string;
  name: string;
  email: string;
  caseId: string;
  maskedPhone: string;
  role: "client" | "admin";
  recoveredUsd: number;
  recoveryRate: number;
  recoveryComplete: boolean;
  clientSince: string;
  blocked?: boolean;
}

export async function login(identifier: string, password: string): Promise<LoginResult> {
  return req<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export async function verifyOTP(pendingToken: string, otp: string): Promise<VerifyResult> {
  return req<VerifyResult>("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ pendingToken, otp }),
  });
}

export async function logout(): Promise<void> {
  await req("/auth/logout", { method: "POST" });
  localStorage.removeItem("sf_token");
  localStorage.removeItem("sf_user");
}

export async function getMe(): Promise<{ user: SFUser }> {
  return req<{ user: SFUser }>("/auth/me");
}

export function saveSession(token: string, user: SFUser): void {
  localStorage.setItem("sf_token", token);
  localStorage.setItem("sf_user", JSON.stringify(user));
}

export type StoredUser = SFUser;

export function getStoredUser(): SFUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("sf_user");
  return raw ? (JSON.parse(raw) as SFUser) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ── Banking ───────────────────────────────────────────────────────────────────

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
  category: string;
  dir: "in" | "out";
}

export interface DashboardData {
  user: { name: string; caseId: string; initials: string; role: "client" | "admin" };
  totalUsd: number;
  recoveredUsd: number;
  recoveryRate: number;
  recoveryComplete: boolean;
  assets: Asset[];
  recentTransactions: Transaction[];
}

export async function getDashboard(): Promise<DashboardData> {
  return req<DashboardData>("/banking/dashboard");
}

export interface TransactionsResult {
  transactions: Transaction[];
  summary: { credited: number; debited: number; pending: number; net: number };
  total: number;
}

export async function getTransactions(filter = "All", search = ""): Promise<TransactionsResult> {
  const q = new URLSearchParams({ filter, search }).toString();
  return req<TransactionsResult>(`/banking/transactions?${q}`);
}

export interface TransferPayload {
  asset: string;
  amount: number;
  destinationId: string;
  destinationLabel: string;
}

export interface TransferResult {
  ok: boolean;
  ref: string;
  fee: number;
  receiveUsd: number;
}

export async function submitTransfer(payload: TransferPayload): Promise<TransferResult> {
  return req<TransferResult>("/banking/transfer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface AccountData {
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

export async function getAccounts(): Promise<{ accounts: AccountData[]; linkedBanks: LinkedBank[] }> {
  return req("/banking/accounts");
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

export async function getCards(): Promise<{ cards: Card[] }> {
  return req("/banking/cards");
}

export async function freezeCard(cardId: string): Promise<{ cards: Card[] }> {
  return req(`/banking/cards/${cardId}/freeze`, { method: "POST" });
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

export interface RecoveryStatusData {
  caseId: string;
  status: string;
  recoveredUsd: number;
  recoveryRate: number;
  recoveryComplete: boolean;
  openedDate: string;
  closedDate?: string;
  originalClaim: number;
  recoveryDays: number;
  networksTraced: number;
  timeline: TimelineEvent[];
  evidence: EvidenceFile[];
}

export async function getRecoveryStatus(): Promise<RecoveryStatusData> {
  return req("/banking/recovery-status");
}

export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  caseId: string;
  clientSince: string;
  initials: string;
  notifications: { email: boolean; sms: boolean; app: boolean };
  privacy: { twoFactor: boolean; biometric: boolean; sessionLock: boolean };
}

export async function getSettings(): Promise<ProfileSettings> {
  return req("/banking/settings");
}

export async function saveSettings(settings: Partial<ProfileSettings>): Promise<{ ok: boolean; settings: ProfileSettings }> {
  return req("/banking/settings", { method: "POST", body: JSON.stringify(settings) });
}

// ── Intake ────────────────────────────────────────────────────────────────────

export interface IntakePayload {
  fullName: string;
  email: string;
  contactChannel: string;
  incidentType: string;
  incidentDate: string;
  narrative: string;
  publicAddresses: string;
  txids: string;
  exchangeTicketIds: string;
  lossEstimate: string;
  consent: boolean;
  honeypot: string;
}

export async function submitIntake(payload: IntakePayload): Promise<{ ok: boolean; caseId: string }> {
  return req("/intake", { method: "POST", body: JSON.stringify(payload) });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface IntakeCase {
  id: string;
  submittedAt: string;
  fullName: string;
  email: string;
  contactChannel: string;
  incidentType: string;
  incidentDate: string;
  narrative: string;
  lossEstimate: string;
  status: "new" | "reviewing" | "in_progress" | "closed";
}

export async function getAdminCases(): Promise<{ cases: IntakeCase[]; total: number }> {
  return req("/admin/cases");
}

export async function patchAdminCase(id: string, status: IntakeCase["status"]): Promise<{ ok: boolean; case: IntakeCase }> {
  return req(`/admin/cases/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export async function getAdminUsers(): Promise<{ users: SFUser[]; total: number }> {
  return req("/admin/users");
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  caseId: string;
  maskedPhone?: string;
  role?: "client" | "admin";
  recoveredUsd?: number;
  recoveryRate?: number;
  recoveryComplete?: boolean;
  clientSince?: string;
}

export async function createAdminUser(payload: CreateUserPayload): Promise<{ ok: boolean; user: SFUser }> {
  return req("/admin/users", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateAdminUser(id: string, patch: Partial<SFUser & { password: string }>): Promise<{ ok: boolean; user: SFUser }> {
  return req(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export async function blockAdminUser(id: string): Promise<{ ok: boolean }> {
  return req(`/admin/users/${id}/block`, { method: "POST" });
}

export async function unblockAdminUser(id: string): Promise<{ ok: boolean }> {
  return req(`/admin/users/${id}/unblock`, { method: "POST" });
}

export interface AdminAsset {
  symbol: string;
  name: string;
  amount: number;
  usd: number;
  usdRate: number;
  change: number;
  color: string;
  icon: string;
}

export async function getAdminUserAssets(id: string): Promise<{ assets: AdminAsset[] }> {
  return req(`/admin/users/${id}/assets`);
}

export async function updateAdminUserAssets(id: string, assets: AdminAsset[]): Promise<{ ok: boolean; assets: AdminAsset[] }> {
  return req(`/admin/users/${id}/assets`, { method: "PUT", body: JSON.stringify({ assets }) });
}
