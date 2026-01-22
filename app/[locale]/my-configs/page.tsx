"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Mail, ArrowRight, Loader2, Search, History, Plus } from "lucide-react";
import { VerificationCodeInput } from "@/components/configurator/verification-code-input";
import { PreviousConfigsList, ConfigurationSummary } from "@/components/configurator/previous-configs-list";
import Link from "next/link";

type PageStep = "email" | "verification" | "configurations";

export default function MyConfigsPage() {
  const t = useTranslations("myConfigs");
  const tReturning = useTranslations("returningUser.modal");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [step, setStep] = useState<PageStep>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | undefined>();
  const [configurations, setConfigurations] = useState<ConfigurationSummary[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [configCount, setConfigCount] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError(undefined);
    setIsSearching(true);

    try {
      // First check if email has configurations
      const lookupResponse = await fetch("/api/email-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!lookupResponse.ok) {
        setEmailError("Failed to check email. Please try again.");
        setIsSearching(false);
        return;
      }

      const lookupData = await lookupResponse.json();

      if (!lookupData.hasConfigurations) {
        setEmailError(t("noConfigsFound"));
        setIsSearching(false);
        return;
      }

      setConfigCount(lookupData.configurationCount);

      // Send verification code
      const sendResponse = await fetch("/api/verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          purpose: "my_configs",
          locale,
        }),
      });

      if (sendResponse.ok) {
        setResendCooldown(60);
        setStep("verification");
      } else if (sendResponse.status === 429) {
        const data = await sendResponse.json();
        setEmailError(tReturning("tooManyAttempts"));
        if (data.retryAfter) {
          setResendCooldown(data.retryAfter);
        }
      } else {
        setEmailError("Failed to send verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setEmailError("An error occurred. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleResend = async () => {
    setVerificationError(undefined);

    try {
      const response = await fetch("/api/verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          purpose: "my_configs",
          locale,
        }),
      });

      if (response.ok) {
        setResendCooldown(60);
      } else if (response.status === 429) {
        const data = await response.json();
        setVerificationError(tReturning("tooManyAttempts"));
        if (data.retryAfter) {
          setResendCooldown(data.retryAfter);
        }
      }
    } catch (error) {
      console.error("Failed to resend:", error);
    }
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
          purpose: "my_configs",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConfigurations(data.configurations);
        setStep("configurations");
      } else {
        setVerificationError(data.error || tReturning("invalidCode"));
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationError(tReturning("invalidCode"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfigSelect = (reference: string, action: "edit" | "duplicate") => {
    if (action === "edit") {
      router.push(`/${locale}/config/${reference}`);
    } else {
      router.push(`/${locale}/config/${reference}?action=duplicate`);
    }
  };

  const handleStartNew = () => {
    router.push(`/${locale}/configurator`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 mb-4">
            <History className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">{t("title")}</h1>
          <p className="text-stone-500 mt-2">{t("subtitle")}</p>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6"
        >
          <AnimatePresence mode="wait">
            {/* Email Step */}
            {step === "email" && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-2 block">
                    {t("emailLabel")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError(undefined);
                      }}
                      className={`w-full h-12 pl-10 pr-4 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:border-transparent ${
                        emailError
                          ? "border-red-400 focus:ring-red-500"
                          : "border-stone-200 focus:ring-brand-500"
                      }`}
                      placeholder={t("emailPlaceholder")}
                      autoFocus
                    />
                  </div>
                  {emailError && (
                    <p className="mt-2 text-sm text-red-500">{emailError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full h-12 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t("searching")}
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      {t("findButton")}
                    </>
                  )}
                </button>

                <div className="pt-4 border-t border-stone-100">
                  <Link
                    href={`/${locale}/configurator`}
                    className="flex items-center justify-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    {t("startNew")}
                  </Link>
                </div>
              </motion.form>
            )}

            {/* Verification Step */}
            {step === "verification" && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-stone-900 mb-2">
                    {tReturning("verifyTitle")}
                  </h2>
                  <p className="text-sm text-stone-500">
                    {t("verificationSent", { email })}
                  </p>
                </div>

                <div className="p-4 bg-brand-50 rounded-lg border border-brand-100 text-center">
                  <p className="text-sm text-brand-700">
                    {t("checkEmail")}
                  </p>
                </div>

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
                  onClick={() => setStep("email")}
                  className="w-full text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                  ← Use a different email
                </button>
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
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-stone-900 mb-1">
                    {tReturning("configsTitle")}
                  </h2>
                  <p className="text-sm text-stone-500">
                    {configurations.length} configuration{configurations.length !== 1 ? "s" : ""} found for {email}
                  </p>
                </div>

                <PreviousConfigsList
                  configurations={configurations}
                  onSelect={handleConfigSelect}
                  onContinueNew={handleStartNew}
                  locale={locale}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
