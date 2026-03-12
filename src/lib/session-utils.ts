/**
 * Session management utilities
 */

const SESSION_TIMEOUT_KEY = "gighold_session_timeout";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING_DURATION = 5 * 60 * 1000; // Show warning 5 minutes before timeout

export interface SessionConfig {
  timeoutMs: number;
  warningDurationMs: number;
}

/**
 * Initialize session timer
 */
export function initializeSessionTimer(): void {
  resetSessionTimer();
}

/**
 * Reset session timer
 */
export function resetSessionTimer(): void {
  const expiresAt = Date.now() + SESSION_TIMEOUT_MS;
  sessionStorage.setItem(SESSION_TIMEOUT_KEY, expiresAt.toString());
}

/**
 * Get session expiration time
 */
export function getSessionExpiryTime(): number | null {
  const expiresAt = sessionStorage.getItem(SESSION_TIMEOUT_KEY);
  if (!expiresAt) {
    return null;
  }
  return parseInt(expiresAt, 10);
}

/**
 * Check if session is still valid
 */
export function isSessionValid(): boolean {
  const expiryTime = getSessionExpiryTime();
  if (!expiryTime) {
    return false;
  }
  return Date.now() < expiryTime;
}

/**
 * Get remaining session time in seconds
 */
export function getSessionTimeRemaining(): number {
  const expiryTime = getSessionExpiryTime();
  if (!expiryTime) {
    return 0;
  }

  const remaining = Math.max(0, expiryTime - Date.now());
  return Math.floor(remaining / 1000);
}

/**
 * Clear session timer
 */
export function clearSessionTimer(): void {
  sessionStorage.removeItem(SESSION_TIMEOUT_KEY);
}

/**
 * Check if should show session warning
 */
export function shouldShowSessionWarning(): boolean {
  const expiryTime = getSessionExpiryTime();
  if (!expiryTime) {
    return false;
  }

  const now = Date.now();
  const timeRemaining = expiryTime - now;

  // Show warning if less than 5 minutes remaining and still valid
  return (
    timeRemaining > 0 &&
    timeRemaining <= SESSION_WARNING_DURATION
  );
}
