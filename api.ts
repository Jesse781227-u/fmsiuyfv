import {
  User,
  Spill,
  Reply,
  PrivateMessage,
  PriorityConfession,
  MatchmakingRequest,
} from './storage';

export interface SessionUser {
  id: string;
  email: string;
  sisterName: string;
  plan: 'free' | 'private' | 'matchmaking';
}

export async function register(body: { email: string; password: string }): Promise<SessionUser | null> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function login(body: { email: string; password: string }): Promise<SessionUser | null> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updatePlan(email: string, plan: string): Promise<SessionUser | null> {
  const res = await fetch('/api/auth/plan', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, plan }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getSpills(params?: { category?: string; sort?: string; userKey?: string }): Promise<Spill[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`/api/spills?${query}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createSpill(body: { text: string; voiceData?: string; sisterName: string; category: string; isPriority?: boolean }): Promise<Spill | null> {
  const res = await fetch('/api/spills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function reactToSpill(id: string, userKey: string, reactionType: string): Promise<Spill | null> {
  const res = await fetch(`/api/spills/${id}/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userKey, reactionType }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function replyToSpill(id: string, body: { sisterName: string; text: string; voiceData?: string; parentReplyId?: string }): Promise<Spill | null> {
  const res = await fetch(`/api/spills/${id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function addTherapistResponse(id: string, text: string): Promise<Spill | null> {
  const res = await fetch(`/api/spills/${id}/therapist-response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, adminPassword: 'therapist2024' }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getPrivateMessages(email: string): Promise<PrivateMessage[]> {
  const res = await fetch(`/api/private-messages/${email}`);
  if (!res.ok) return [];
  return res.json();
}

export async function sendPrivateMessage(body: { userEmail: string; text: string }): Promise<PrivateMessage | null> {
  const res = await fetch('/api/private-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 403) throw new Error('upgrade_required');
  if (!res.ok) return null;
  return res.json();
}

export async function getPriorityConfessions(email: string): Promise<PriorityConfession[]> {
  const res = await fetch(`/api/priority-confessions/${email}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createPriorityConfession(body: { userEmail: string; sisterName: string; text: string; category: string }): Promise<PriorityConfession | null> {
  const res = await fetch('/api/priority-confessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function respondToPriorityConfession(id: string, text: string): Promise<PriorityConfession | null> {
  const res = await fetch(`/api/priority-confessions/${id}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, adminPassword: 'therapist2024' }),
  });
  if (!res.ok) return null;
  return res.json();
}

// ── Matchmaking ───────────────────────────────────────────────────────────────
export async function getMatchmakingRequests(email: string): Promise<MatchmakingRequest[]> {
  const res = await fetch(`/api/matchmaking/${email}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createMatchmakingRequest(body: {
  userEmail: string;
  sisterName: string;
  ageRange: string;
  location: string;
  interests: string;
  dealbreakers: string;
  bio: string;
}): Promise<MatchmakingRequest | null> {
  const res = await fetch('/api/matchmaking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateMatchmakingStatus(id: string, status: string, adminNotes?: string): Promise<MatchmakingRequest | null> {
  const res = await fetch(`/api/matchmaking/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, adminNotes, adminPassword: 'therapist2024' }),
  });
  if (!res.ok) return null;
  return res.json();
}

// ── Admin ─────────────────────────────────────────────────────────────────────
const adminHeader = { 'x-admin-password': 'therapist2024' };

export async function adminGetSpills(): Promise<Spill[]> {
  const res = await fetch('/api/admin/spills', { headers: adminHeader });
  return res.ok ? res.json() : [];
}

export async function adminGetPrivateMessages(): Promise<any[]> {
  const res = await fetch('/api/admin/private-messages', { headers: adminHeader });
  return res.ok ? res.json() : [];
}

export async function adminGetPriorityConfessions(): Promise<PriorityConfession[]> {
  const res = await fetch('/api/admin/priority-confessions', { headers: adminHeader });
  return res.ok ? res.json() : [];
}

export async function adminGetUsers(): Promise<User[]> {
  const res = await fetch('/api/admin/users', { headers: adminHeader });
  return res.ok ? res.json() : [];
}

export async function adminGetMatchmaking(): Promise<MatchmakingRequest[]> {
  const res = await fetch('/api/admin/matchmaking', { headers: adminHeader });
  return res.ok ? res.json() : [];
}

export async function adminReplyPrivate(userEmail: string, text: string): Promise<any> {
  const res = await fetch('/api/private-messages/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail, text, adminPassword: 'therapist2024' }),
  });
  return res.ok ? res.json() : null;
}
