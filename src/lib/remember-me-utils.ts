/**
 * Remember Me functionality
 */

const REMEMBER_ME_KEY = "gighold_remember_me_token";
const REMEMBER_ME_EMAIL_KEY = "gighold_remember_me_email";
const REMEMBER_ME_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface RememberMeData {
  email: string;
  token: string;
  expiresAt: number;
}

/**
 * Save Remember Me token and email
 */
export function setRememberMe(email: string, token: string): void {
  const rememberMeData: RememberMeData = {
    email,
    token,
    expiresAt: Date.now() + REMEMBER_ME_DURATION_MS,
  };

  localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(rememberMeData));
  localStorage.setItem(REMEMBER_ME_EMAIL_KEY, email);
}

/**
 * Get Remember Me token
 */
export function getRememberMeToken(): RememberMeData | null {
  const stored = localStorage.getItem(REMEMBER_ME_KEY);

  if (!stored) {
    return null;
  }

  const data: RememberMeData = JSON.parse(stored);

  // Check if token has expired
  if (Date.now() > data.expiresAt) {
    clearRememberMe();
    return null;
  }

  return data;
}

/**
 * Get remembered email
 */
export function getRememberedEmail(): string | null {
  return localStorage.getItem(REMEMBER_ME_EMAIL_KEY);
}

/**
 * Clear Remember Me data
 */
export function clearRememberMe(): void {
  localStorage.removeItem(REMEMBER_ME_KEY);
  localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
}

/**
 * Check if Remember Me is enabled and valid
 */
export function hasValidRememberMeToken(): boolean {
  return getRememberMeToken() !== null;
}
