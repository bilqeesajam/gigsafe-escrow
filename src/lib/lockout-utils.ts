/**
 * Account lockout and login attempt tracking
 */

const LOCKOUT_KEY_PREFIX = "login_lockout_";
const ATTEMPTS_KEY_PREFIX = "login_attempts_";
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface LoginAttempt {
  email: string;
  timestamp: number;
  attempts: number;
  lockedUntil?: number;
}

/**
 * Get login attempts for an email
 */
export function getLoginAttempts(email: string): LoginAttempt {
  const key = ATTEMPTS_KEY_PREFIX + email.toLowerCase();
  const stored = localStorage.getItem(key);

  if (!stored) {
    return {
      email,
      timestamp: Date.now(),
      attempts: 0,
    };
  }

  return JSON.parse(stored);
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(email: string): LoginAttempt {
  const attempts = getLoginAttempts(email);
  attempts.attempts += 1;
  attempts.timestamp = Date.now();

  if (attempts.attempts >= MAX_FAILED_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }

  const key = ATTEMPTS_KEY_PREFIX + email.toLowerCase();
  localStorage.setItem(key, JSON.stringify(attempts));

  return attempts;
}

/**
 * Clear login attempts after successful login
 */
export function clearLoginAttempts(email: string): void {
  const key = ATTEMPTS_KEY_PREFIX + email.toLowerCase();
  localStorage.removeItem(key);
}

/**
 * Check if account is currently locked
 */
export function isAccountLocked(email: string): boolean {
  const attempts = getLoginAttempts(email);

  if (!attempts.lockedUntil) {
    return false;
  }

  const now = Date.now();
  if (now > attempts.lockedUntil) {
    // Lockout expired, reset attempts
    clearLoginAttempts(email);
    return false;
  }

  return true;
}

/**
 * Get minutes remaining until lock expires
 */
export function getLockoutTimeRemaining(email: string): number {
  const attempts = getLoginAttempts(email);

  if (!attempts.lockedUntil) {
    return 0;
  }

  const now = Date.now();
  if (now > attempts.lockedUntil) {
    return 0;
  }

  return Math.ceil((attempts.lockedUntil - now) / 60000);
}

/**
 * Get remaining attempts before lockout
 */
export function getRemainingAttempts(email: string): number {
  const attempts = getLoginAttempts(email);
  return Math.max(0, MAX_FAILED_ATTEMPTS - attempts.attempts);
}
