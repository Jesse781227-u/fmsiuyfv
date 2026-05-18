import { SessionUser } from './api';

export function getSession(): SessionUser | null {
  const data = localStorage.getItem('fms_session');
  return data ? JSON.parse(data) : null;
}

export function setSession(user: SessionUser | null): void {
  if (user) {
    localStorage.setItem('fms_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('fms_session');
  }
}

export function getAnonKey(): string {
  let key = localStorage.getItem('fms_anon_key');
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem('fms_anon_key', key);
  }
  return key;
}
