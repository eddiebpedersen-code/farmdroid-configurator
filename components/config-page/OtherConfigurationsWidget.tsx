"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Lock,
  Unlock,
  ChevronRight,
  Rows3,
  Zap,
  Sun,
  Droplets,
  Eye,
} from "lucide-react";
import { useTranslations } from "next-intl";
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
  viewCount?: number;
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

const SESSION_STORAGE_KEY = "farmdroid_verified_configs";

export function OtherConfigurationsWidget({ data }: OtherConfigurationsWidgetProps) {
  const t = useTranslations("returningUser");
  const tModal = useTranslations("returningUser.modal");
  const router = useRouter();

  const [state, setState] = useState<WidgetState>("checking");
  const [configCount, setConfigCount] = useState(0);
  const [configurations, setConfigurations] = useState<ConfigurationSummary[]>([]);
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

  // Check for cached verification or other configurations on mount
  useEffect(() => {
    const checkOtherConfigs = async () => {
      // First check if we have cached verified configurations for this email
      try {
        const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (cached) {
          const { email: cachedEmail, configurations: cachedConfigs, timestamp } = JSON.parse(cached);
          // Cache valid for 30 minutes
          const isValid = cachedEmail === email && Date.now() - timestamp < 30 * 60 * 1000;
          if (isValid && cachedConfigs) {
            const otherConfigs = cachedConfigs.filter(
              (c: ConfigurationSummary) => c.reference !== currentReference
            );
            if (otherConfigs.length > 0) {
              setConfigurations(otherConfigs);
              setConfigCount(otherConfigs.length);
              setState("unlocked");
              return;
            }
          }
        }
      } catch (e) {
        // sessionStorage might not be available
      }

      // Otherwise check via API
      try {
        const response = await fetch("/api/email-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const data = await response.json();
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
  }, [email, currentReference]);

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
        setResendCooldown(90);
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
        // Cache the verified configurations in sessionStorage
        try {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            email,
            configurations: result.configurations,
            timestamp: Date.now(),
          }));
        } catch (e) {
          // sessionStorage might not be available
        }

        // Filter out the current configuration
        const otherConfigs = result.configurations.filter(
          (c: ConfigurationSummary) => c.reference !== currentReference
        );
        setConfigurations(otherConfigs);
        setState("unlocked");
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
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden print:hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${state === "unlocked" ? "bg-emerald-100 text-emerald-600" : "bg-stone-100 text-stone-500"}`}>
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">
                {state === "unlocked"
                  ? t("indicator.found", { count: configurations.length })
                  : t("indicator.havePrevious")}
              </h3>
              <p className="text-sm text-stone-500">
                {state === "locked" && t("indicator.verifyToView")}
                {state === "verifying" && t("indicator.enterCode")}
                {state === "unlocked" && t("indicator.clickToView")}
              </p>
            </div>
          </div>
          {state === "locked" && (
            <button
              onClick={handleUnlock}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Unlock className="w-4 h-4" />
              {t("indicator.unlock")}
            </button>
          )}
        </div>
      </div>

      {/* Verification Section */}
      <AnimatePresence>
        {state === "verifying" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="p-6 bg-stone-50">
              {codeSent && (
                <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                  <p className="text-sm text-emerald-700">
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

      {/* Configurations Table */}
      <AnimatePresence>
        {state === "unlocked" && configurations.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Reference</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Configuration</th>
                    <th className="text-center text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">{t("table.views")}</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3">Price</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-5 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {configurations.map((config, index) => (
                    <motion.tr
                      key={config.reference}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => router.push(`/${locale}/config/${config.reference}`)}
                      className="hover:bg-stone-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-medium text-stone-900">
                          {config.reference}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-stone-600">
                          {formatDate(config.createdAt)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded text-xs text-stone-600">
                            <Rows3 className="h-3 w-3" />
                            <span>{config.config.activeRows}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded text-xs text-stone-600">
                            {config.config.powerSource === "hybrid" ? (
                              <Zap className="h-3 w-3" />
                            ) : (
                              <Sun className="h-3 w-3" />
                            )}
                            <span className="capitalize">{config.config.powerSource}</span>
                          </div>
                          {config.config.spraySystem && (
                            <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded text-xs text-blue-600">
                              <Droplets className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-stone-500">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{config.viewCount ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-semibold text-stone-900">
                          {formatPrice(config.totalPrice, config.currency)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-stone-600 transition-colors" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {state === "unlocked" && configurations.length === 0 && (
        <div className="p-6 text-center text-stone-500">
          No other configurations found
        </div>
      )}
    </motion.div>
  );
}
