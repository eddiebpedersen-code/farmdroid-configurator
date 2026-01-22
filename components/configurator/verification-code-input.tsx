"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface VerificationCodeInputProps {
  onComplete: (code: string) => void;
  onResend: () => void;
  isLoading: boolean;
  error?: string;
  canResend: boolean;
  resendCooldown: number;
}

export function VerificationCodeInput({
  onComplete,
  onResend,
  isLoading,
  error,
  canResend,
  resendCooldown,
}: VerificationCodeInputProps) {
  const t = useTranslations("returningUser.modal");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newDigits.every((d) => d !== "")) {
      onComplete(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    if (pastedData) {
      const newDigits = pastedData.split("").concat(Array(6 - pastedData.length).fill(""));
      setDigits(newDigits.slice(0, 6));

      // Focus the next empty input or last input
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();

      // Check if complete
      if (pastedData.length === 6) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Code inputs */}
      <div className="flex justify-center gap-2">
        {digits.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={`w-12 h-14 text-center text-2xl font-mono font-bold rounded-lg border-2 transition-all focus:outline-none focus:ring-0 ${
              error
                ? "border-red-400 bg-red-50 text-red-600"
                : digit
                ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                : "border-stone-200 focus:border-stone-400"
            } disabled:opacity-50`}
            initial={{ scale: 1 }}
            animate={digit ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 0.15 }}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 text-center"
        >
          {error}
        </motion.p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{t("verifying")}</span>
        </div>
      )}

      {/* Resend button */}
      <div className="text-center">
        {canResend ? (
          <button
            type="button"
            onClick={onResend}
            disabled={isLoading}
            className="text-sm text-emerald-600 hover:text-emerald-700 underline transition-colors disabled:opacity-50"
          >
            {t("resend")}
          </button>
        ) : (
          <span className="text-sm text-stone-400">
            {t("resendIn", { seconds: resendCooldown })}
          </span>
        )}
      </div>
    </div>
  );
}
