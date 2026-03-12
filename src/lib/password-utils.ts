/**
 * Password strength validation utilities
 */

export interface PasswordStrength {
  score: number; // 0-4: weak, fair, good, strong, very strong
  label: string;
  color: string;
  feedback: string[];
}

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = {
  minLength: PASSWORD_MIN_LENGTH,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Check length
  if (password.length >= PASSWORD_MIN_LENGTH) {
    score++;
  } else {
    feedback.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
  }

  // Check for uppercase
  if (PASSWORD_REQUIREMENTS.hasUpperCase.test(password)) {
    score++;
  } else {
    feedback.push("At least one uppercase letter");
  }

  // Check for lowercase
  if (PASSWORD_REQUIREMENTS.hasLowerCase.test(password)) {
    score++;
  } else {
    feedback.push("At least one lowercase letter");
  }

  // Check for number
  if (PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
    score++;
  } else {
    feedback.push("At least one number");
  }

  // Check for special character
  if (PASSWORD_REQUIREMENTS.hasSpecialChar.test(password)) {
    score++;
  } else {
    feedback.push("At least one special character (!@#$%^&*)");
  }

  // Determine strength level
  let label = "Weak";
  let color = "text-red-500";

  if (score <= 1) {
    label = "Weak";
    color = "text-red-500";
  } else if (score === 2) {
    label = "Fair";
    color = "text-orange-500";
  } else if (score === 3) {
    label = "Good";
    color = "text-yellow-500";
  } else if (score === 4) {
    label = "Strong";
    color = "text-lime-500";
  } else if (score >= 5) {
    label = "Very Strong";
    color = "text-green-500";
  }

  return {
    score,
    label,
    color,
    feedback: score < 5 ? feedback : [], // No feedback for very strong passwords
  };
}

export function isPasswordStrong(password: string): boolean {
  const strength = validatePasswordStrength(password);
  return strength.score >= 4; // Require "Strong" or "Very Strong"
}

export function getPasswordRequirements(password: string): {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
} {
  return {
    hasMinLength: password.length >= PASSWORD_MIN_LENGTH,
    hasUpperCase: PASSWORD_REQUIREMENTS.hasUpperCase.test(password),
    hasLowerCase: PASSWORD_REQUIREMENTS.hasLowerCase.test(password),
    hasNumber: PASSWORD_REQUIREMENTS.hasNumber.test(password),
    hasSpecialChar: PASSWORD_REQUIREMENTS.hasSpecialChar.test(password),
  };
}
