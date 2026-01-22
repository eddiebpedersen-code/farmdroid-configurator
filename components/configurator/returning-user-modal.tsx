"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, History, ArrowRight, Mail, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VerificationCodeInput } from "./verification-code-input";
import { PreviousConfigsList, ConfigurationSummary } from "./previous-configs-list";

type ModalStep = "welcome" | "verification" | "configurations";

interface ReturningUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  configCount: number;
  onContinueNew: () => void;
}

export function ReturningUserModal({
  isOpen,
  onClose,
  email,
  configCount,
  onContinueNew,
}: ReturningUserModalProps) {
  const t = useTranslations("returningUser.modal");
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "en";

  const [step, setStep] = useState<ModalStep>("welcome");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | undefined>();
  const [configurations, setConfigurations] = useState<ConfigurationSummary[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("welcome");
      setIsVerifying(false);
      setVerificationError(undefined);
      setConfigurations([]);
      setCodeSent(false);
    }
  }, [isOpen]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
      } else if (response.status === 429) {
        const data = await response.json();
        setVerificationError(t("tooManyAttempts"));
        if (data.retryAfter) {
          setResendCooldown(data.retryAfter);
        }
      } else {
        setVerificationError("Failed to send verification code");
      }
    } catch (error) {
      console.error("Failed to send verification code:", error);
      setVerificationError("Failed to send verification code");
    }
  }, [email, locale, t]);

  const handleViewPrevious = async () => {
    setStep("verification");
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

      const data = await response.json();

      if (response.ok && data.success) {
        setConfigurations(data.configurations);
        setStep("configurations");
      } else {
        setVerificationError(data.error || t("invalidCode"));
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationError(t("invalidCode"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setVerificationError(undefined);
    await sendVerificationCode();
  };

  const handleConfigSelect = (reference: string, action: "edit" | "duplicate") => {
    onClose();

    if (action === "edit") {
      // Navigate to config page for editing
      router.push(`/${locale}/config/${reference}`);
    } else {
      // Navigate to configurator with config as template
      // The config page will handle loading and encoding
      router.push(`/${locale}/config/${reference}?action=duplicate`);
    }
  };

  const handleContinueNew = () => {
    onClose();
    onContinueNew();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "welcome" && (
              <>
                <History className="h-5 w-5 text-emerald-500" />
                {t("title")}
              </>
            )}
            {step === "verification" && (
              <>
                <Mail className="h-5 w-5 text-emerald-500" />
                {t("verifyTitle")}
              </>
            )}
            {step === "configurations" && (
              <>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                {t("configsTitle")}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "welcome" && t("subtitle", { email })}
            {step === "verification" && t("verifySubtitle", { email })}
            {step === "configurations" && t("configsSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            {/* Welcome Step */}
            {step === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                <button
                  type="button"
                  onClick={handleViewPrevious}
                  className="w-full p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-stone-900">{t("viewPrevious")}</h4>
                      <p className="text-sm text-stone-500 mt-0.5">
                        {configCount} {configCount === 1 ? "configuration" : "configurations"} found
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleContinueNew}
                  className="w-full p-4 rounded-xl border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-stone-900">{t("continueNew")}</h4>
                      <p className="text-sm text-stone-500 mt-0.5">
                        Start fresh with a new configuration
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </motion.div>
            )}

            {/* Verification Step */}
            {step === "verification" && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {codeSent && (
                  <div className="mb-6 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-sm text-emerald-700 text-center">
                      A verification code has been sent to <strong>{email}</strong>
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
              </motion.div>
            )}

            {/* Configurations Step */}
            {step === "configurations" && (
              <motion.div
                key="configurations"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <PreviousConfigsList
                  configurations={configurations}
                  onSelect={handleConfigSelect}
                  onContinueNew={handleContinueNew}
                  locale={locale}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
