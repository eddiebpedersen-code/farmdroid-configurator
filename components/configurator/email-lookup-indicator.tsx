"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmailLookupIndicatorProps {
  email: string;
  onRecognized: (count: number) => void;
  onClick: () => void;
  debounceMs?: number;
}

export function EmailLookupIndicator({
  email,
  onRecognized,
  onClick,
  debounceMs = 500,
}: EmailLookupIndicatorProps) {
  const t = useTranslations("returningUser.indicator");
  const [isChecking, setIsChecking] = useState(false);
  const [configCount, setConfigCount] = useState(0);
  const [lastCheckedEmail, setLastCheckedEmail] = useState("");

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const checkEmail = useCallback(async (emailToCheck: string) => {
    if (!isValidEmail(emailToCheck)) {
      setConfigCount(0);
      return;
    }

    // Skip if already checked this email
    if (emailToCheck.toLowerCase() === lastCheckedEmail.toLowerCase()) {
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch("/api/email-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToCheck }),
      });

      if (response.ok) {
        const data = await response.json();
        setConfigCount(data.configurationCount);
        setLastCheckedEmail(emailToCheck);

        if (data.configurationCount > 0) {
          onRecognized(data.configurationCount);
        }
      }
    } catch (error) {
      console.error("Email lookup error:", error);
    } finally {
      setIsChecking(false);
    }
  }, [lastCheckedEmail, onRecognized]);

  // Debounced email check
  useEffect(() => {
    if (!email || !isValidEmail(email)) {
      setConfigCount(0);
      return;
    }

    const timer = setTimeout(() => {
      checkEmail(email);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [email, debounceMs, checkEmail]);

  // Don't show anything if no configurations found
  if (!isChecking && configCount === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-2"
      >
        {isChecking ? (
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{t("checking")}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 text-xs text-brand-600 hover:text-brand-700 transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            <span>{t("found", { count: configCount })}</span>
            <span className="underline">{t("viewPrevious")}</span>
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
