import { DEFAULT_USER_BASELINE } from './safecallEngine';

const STORAGE_KEY_USER = 'safecall_user_profile_v2';
const STORAGE_KEY_GUIDE = 'safecall_guide_seen_v2';
const STORAGE_KEY_SESSIONS = 'safecall_sessions_v1';

export function getUserProfile() {
  if (typeof window === 'undefined') return DEFAULT_USER_BASELINE;
  try {
    const data = localStorage.getItem(STORAGE_KEY_USER);
    if (data) return { ...DEFAULT_USER_BASELINE, ...JSON.parse(data) };
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_USER_BASELINE;
}

export function saveUserProfile(profile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
}

export function hasSeenGuide() {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY_GUIDE) === 'true';
}

export function markGuideAsSeen() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_GUIDE, 'true');
}

export function resetOnboarding() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_GUIDE);
  localStorage.removeItem(STORAGE_KEY_SESSIONS);
}

export function getSessions() {
  if (typeof window === 'undefined') return [];
  try {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) || '[]');
    return Array.isArray(sessions) ? sessions : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function saveSession(session) {
  if (typeof window === 'undefined') return null;
  try {
    const sessions = getSessions();
    const saved = {
      ...session,
      id: session.id || (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      timestamp: session.timestamp || new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify([saved, ...sessions].slice(0, 250)));
    return saved;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function clearSessions() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_SESSIONS);
}
