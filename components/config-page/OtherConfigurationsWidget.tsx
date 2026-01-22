"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Loader2,
  ExternalLink,
  Calendar,
  Rows3,
  Zap,
  Sun
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ConfigPageData } from "@/lib/config-page-types";
import { formatPrice, Currency } from "@/lib/configurator-data";
import { VerificationCodeInput } from "@/components/configurator/verification-code-input";

interface ConfigurationSummary {
  reference: string;
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  currency: Currency;
  status: string;
  config: {
    activeRows: number;
    seedSize: string;
    powerSource: string;
    spraySystem: boolean;
    frontWheel: string;
    starterKit: boolean;
  };
}

interface OtherConfigurationsWidgetProps {
  data: ConfigPageData;
}

type WidgetState = "checking" | "none" | "locked" | "verifying" | "unlocked";

export function OtherConfigurationsWidget({ data }: OtherConfigurationsWidgetProps) {
  const t = useTranslations("returningUser");
  const tModal = useTranslations("returningUser.modal");

  const [state, setState] = useState<WidgetState>("checking");
  const [configCount, setConfigCount] = useState(0);
  const [configurations, setConfigurations] = useState<ConfigurationSummary[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | undefined>();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  const email = data.lead.email;
  const currentReference = data.reference;
  const locale = data.locale;

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Check for other configurations on mount
  useEffect(() => {
    const checkOtherConfigs = async () => {
      try {
        const response = await fetch("/api/email-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const data = await response.json();
          // Subtract 1 because we don't count the current configuration
          const otherCount = Math.max(0, data.configurationCount - 1);
          setConfigCount(otherCount);
          setState(otherCount > 0 ? "locked" : "none");
        } else {
          setState("none");
        }
      } catch (error) {
        console.error("Failed to check other configurations:", error);
        setState("none");
      }
    };

    checkOtherConfigs();
  }, [email]);

  const sendVerificationCode = useCallback(async () => {
    try {
      const response = await fetch("/api/verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          purpose: "email_lookup",
          locale,
        }),
      });

      if (response.ok) {
        setCodeSent(true);
        setResendCooldown(60);
        setVerificationError(undefined);
        return true;
      } else if (response.status === 429) {
        const data = await response.json();
        setVerificationError(tModal("tooManyAttempts"));
        if (data.retryAfter) {
          setResendCooldown(data.retryAfter);
        }
      } else {
        setVerificationError("Failed to send verification code");
      }
      return false;
    } catch (error) {
      console.error("Failed to send verification code:", error);
      setVerificationError("Failed to send verification code");
      return false;
    }
  }, [email, locale, tModal]);

  const handleUnlock = async () => {
    setState("verifying");
    setCodeSent(false);
    await sendVerificationCode();
  };

  const handleCodeComplete = async (code: string) => {
    setIsVerifying(true);
    setVerificationError(undefined);

    try {
      const response = await fetch("/api/verification/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          purpose: "email_lookup",
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Filter out the current configuration
        const otherConfigs = result.configurations.filter(
          (c: ConfigurationSummary) => c.reference !== currentReference
        );
        setConfigurations(otherConfigs);
        setState("unlocked");
        setIsExpanded(true);
      } else {
        setVerificationError(result.error || tModal("invalidCode"));
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationError(tModal("invalidCode"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setVerificationError(undefined);
    await sendVerificationCode();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "en" ? "en-GB" : locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Don't render anything if checking or no other configs
  if (state === "checking" || state === "none") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden print:hidden"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => {
          if (state === "locked") {
            handleUnlock();
          } else if (state === "unlocked") {
            setIsExpanded(!isExpanded);
          }
        }}
        disabled={state === "verifying"}
        className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors disabled:hover:bg-white"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${state === "unlocked" ? "bg-brand-100 text-brand-600" : "bg-amber-100 text-amber-600"}`}>
            {state === "unlocked" ? (
              <Unlock className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          <div className="text-left">
            <h3 className="font-medium text-stone-900">
              {state === "unlocked"
                ? t("indicator.found", { count: configurations.length })
                : t("indicator.found", { count: configCount })}
            </h3>
            <p className="text-sm text-stone-500">
              {state === "locked" && "Verify your email to view them"}
              {state === "verifying" && "Enter the code sent to your email"}
              {state === "unlocked" && "Click to expand"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state === "locked" && (
            <span className="text-sm text-brand-600 font-medium">Unlock</span>
          )}
          {state === "unlocked" && (
            isExpanded ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )
          )}
        </div>
      </button>

      {/* Verification Section */}
      <AnimatePresence>
        {state === "verifying" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-stone-100"
          >
            <div className="p-6">
              {codeSent && (
                <div className="mb-4 p-3 bg-brand-50 rounded-lg border border-brand-100 text-center">
                  <p className="text-sm text-brand-700">
                    Verification code sent to <strong>{email}</strong>
                  </p>
                </div>
              )}

              <VerificationCodeInput
                onComplete={handleCodeComplete}
                onResend={handleResend}
                isLoading={isVerifying}
                error={verificationError}
                canResend={resendCooldown === 0}
                resendCooldown={resendCooldown}
              />

              <button
                type="button"
                onClick={() => setState("locked")}
                className="w-full mt-4 text-sm text-stone-500 hover:text-stone-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configurations List */}
      <AnimatePresence>
        {state === "unlocked" && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-stone-100"
          >
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {configurations.map((config, index) => (
                <motion.div
                  key={config.reference}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-stone-50 rounded-lg p-4 border border-stone-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono text-sm font-medium text-stone-700">
                        {config.reference}
                      </span>
                      <div className="flex items-center gap-1 mt-1 text-xs text-stone-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(config.createdAt)}</span>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-stone-900">
                      {formatPrice(config.totalPrice, config.currency)}
                    </span>
                  </div>

                  {/* Config summary */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md text-xs text-stone-600 border border-stone-100">
                      <Rows3 className="h-3 w-3" />
                      <span>{config.config.activeRows} rows</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md text-xs text-stone-600 border border-stone-100">
                      {config.config.powerSource === "hybrid" ? (
                        <Zap className="h-3 w-3" />
                      ) : (
                        <Sun className="h-3 w-3" />
                      )}
                      <span className="capitalize">{config.config.powerSource}</span>
                    </div>
                    {config.config.spraySystem && (
                      <div className="bg-blue-50 px-2 py-1 rounded-md text-xs text-blue-600 border border-blue-100">
                        +Spray
                      </div>
                    )}
                  </div>

                  {/* View button */}
                  <Link
                    href={`/${locale}/config/${config.reference}`}
                    className="flex items-center justify-center gap-2 w-full h-9 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    View Configuration
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </motion.div>
              ))}

              {configurations.length === 0 && (
                <p className="text-center text-stone-500 py-4">
                  No other configurations found
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
