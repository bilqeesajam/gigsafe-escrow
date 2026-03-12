import { validatePasswordStrength, getPasswordRequirements } from "@/lib/password-utils";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  showFeedback?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  showFeedback = true,
}: PasswordStrengthIndicatorProps) {
  const strength = validatePasswordStrength(password);
  const requirements = getPasswordRequirements(password);

  if (!password) {
    return null;
  }

  // Get color classes based on strength score
  const getColorClasses = (score: number) => {
    switch (score) {
      case 1:
        return {
          bg: "bg-red-500",
          text: "text-red-500",
          label: "text-red-400",
        };
      case 2:
        return {
          bg: "bg-orange-500",
          text: "text-orange-500",
          label: "text-orange-400",
        };
      case 3:
        return {
          bg: "bg-yellow-500",
          text: "text-yellow-500",
          label: "text-yellow-400",
        };
      case 4:
        return {
          bg: "bg-lime-500",
          text: "text-lime-500",
          label: "text-lime-400",
        };
      case 5:
        return {
          bg: "bg-green-500",
          text: "text-green-500",
          label: "text-green-400",
        };
      default:
        return {
          bg: "bg-gray-500",
          text: "text-gray-500",
          label: "text-gray-400",
        };
    }
  };

  const colors = getColorClasses(strength.score);

  return (
    <div className="space-y-2">
      {/* Strength Meter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#66758a]">Strength:</span>
        <div className="flex-1 h-2 bg-[#1a2a42] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${colors.bg}`}
            style={{
              width: `${(strength.score / 5) * 100}%`,
            }}
          />
        </div>
        <span className={`text-sm font-medium ${colors.label}`}>
          {strength.label}
        </span>
      </div>

      {/* Requirements Checklist */}
      {showFeedback && (
        <div className="space-y-1 text-xs">
          <div
            className={`flex items-center gap-2 ${
              requirements.hasMinLength ? colors.text : "text-[#66758a]"
            }`}
          >
            {requirements.hasMinLength ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            At least 8 characters
          </div>
          <div
            className={`flex items-center gap-2 ${
              requirements.hasUpperCase ? colors.text : "text-[#66758a]"
            }`}
          >
            {requirements.hasUpperCase ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            One uppercase letter (A-Z)
          </div>
          <div
            className={`flex items-center gap-2 ${
              requirements.hasLowerCase ? colors.text : "text-[#66758a]"
            }`}
          >
            {requirements.hasLowerCase ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            One lowercase letter (a-z)
          </div>
          <div
            className={`flex items-center gap-2 ${
              requirements.hasNumber ? colors.text : "text-[#66758a]"
            }`}
          >
            {requirements.hasNumber ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            One number (0-9)
          </div>
          <div
            className={`flex items-center gap-2 ${
              requirements.hasSpecialChar ? colors.text : "text-[#66758a]"
            }`}
          >
            {requirements.hasSpecialChar ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            One special character (!@#$%^&*)
          </div>
        </div>
      )}
    </div>
  );
}
