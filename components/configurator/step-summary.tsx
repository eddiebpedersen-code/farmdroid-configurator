"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Building2,
  Check,
  Cpu,
  Zap,
  Circle,
  Rows3,
  Droplets,
  Package,
  X,
  Send,
  Loader2,
  Truck,
  Shield,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ConfiguratorState,
  PriceBreakdown,
  formatPrice,
  calculatePassiveRows,
  calculateRowWorkingWidth,
  PRICES,
} from "@/lib/configurator-data";

interface StepSummaryProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  priceBreakdown: PriceBreakdown;
  onReset: () => void;
}

// Email Quote Modal
function EmailQuoteModal({
  isOpen,
  onClose,
  config,
  priceBreakdown,
}: {
  isOpen: boolean;
  onClose: () => void;
  config: ConfiguratorState;
  priceBreakdown: PriceBreakdown;
}) {
  const tForms = useTranslations("forms");
  const tModals = useTranslations("modals");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => {
      onClose();
      setSent(false);
      setEmail("");
      setName("");
      setCompany("");
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden"
      >
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-stone-900">{tModals("emailQuote.title")}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-stone-100 text-stone-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-stone-900" />
              </div>
              <h4 className="text-lg font-semibold text-stone-900">{tModals("emailQuote.sent")}</h4>
              <p className="text-stone-500 mt-1">{tModals("emailQuote.checkInbox")}</p>
            </motion.div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-stone-700">{tForms("name")}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  placeholder={tForms("placeholders.yourName")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700">{tForms("company")}</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1 w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  placeholder={tForms("placeholders.companyName")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700">{tForms("email")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  placeholder={tForms("placeholders.email")}
                />
              </div>

              <div className="bg-stone-50 rounded-lg p-4 mt-4">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">{tModals("emailQuote.quotePreview")}</p>
                <p className="text-lg font-bold text-stone-900">{formatPrice(priceBreakdown.total, config.currency)}</p>
              </div>
            </>
          )}
        </div>

        {!sent && (
          <div className="p-6 border-t border-stone-100">
            <button
              onClick={handleSend}
              disabled={!email || sending}
              className="w-full h-12 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {sending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {tModals("emailQuote.sending")}
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {tModals("emailQuote.sendQuote")}
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Create Deal Modal
function CreateDealModal({
  isOpen,
  onClose,
  config,
  priceBreakdown,
}: {
  isOpen: boolean;
  onClose: () => void;
  config: ConfiguratorState;
  priceBreakdown: PriceBreakdown;
}) {
  const tForms = useTranslations("forms");
  const tModals = useTranslations("modals");
  const [dealName, setDealName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCreating(false);
    setCreated(true);
    setTimeout(() => {
      onClose();
      setCreated(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden"
      >
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-stone-900">{tModals("createDeal.title")}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-stone-100 text-stone-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {created ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-stone-900" />
              </div>
              <h4 className="text-lg font-semibold text-stone-900">{tModals("createDeal.created")}</h4>
              <p className="text-stone-500 mt-1">{tModals("createDeal.addedToPipeline")}</p>
            </motion.div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-stone-700">{tForms("dealName")}</label>
                <input
                  type="text"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  className="mt-1 w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  placeholder={tForms("placeholders.dealName")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700">{tForms("company")}</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  placeholder={tForms("placeholders.companyName")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700">{tForms("contactName")}</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-1 w-full h-11 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  placeholder={tForms("placeholders.primaryContact")}
                />
              </div>

              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">{tModals("createDeal.dealValue")}</p>
                <p className="text-2xl font-bold text-stone-900">{formatPrice(priceBreakdown.total, config.currency)}</p>
              </div>
            </>
          )}
        </div>

        {!created && (
          <div className="p-6 border-t border-stone-100">
            <button
              onClick={handleCreate}
              disabled={!dealName || creating}
              className="w-full h-12 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {creating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {tModals("createDeal.creating")}
                </>
              ) : (
                <>
                  <Building2 className="h-5 w-5" />
                  {tModals("createDeal.createDeal")}
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function StepSummary({ config, priceBreakdown, onReset }: StepSummaryProps) {
  const t = useTranslations("summary");
  const tCommon = useTranslations("common");
  const tModals = useTranslations("modals");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);

  const passiveRows = calculatePassiveRows(config.activeRows, config.rowDistance);
  const workingWidth = calculateRowWorkingWidth(config.activeRows, config.rowDistance, config.frontWheel, config.rowSpacings);

  const lineItems = [
    {
      icon: Cpu,
      label: t("lineItems.baseRobot"),
      value: priceBreakdown.baseRobot,
      included: true,
    },
    config.powerSource === "hybrid" && {
      icon: Zap,
      label: t("lineItems.hybridPower"),
      value: priceBreakdown.powerSource,
    },
    config.frontWheel !== "PFW" && {
      icon: Circle,
      label: config.frontWheel === "AFW" ? t("lineItems.activeFrontWheel") : t("lineItems.dualFrontWheel"),
      value: priceBreakdown.frontWheel,
    },
    config.activeRows > 0 && {
      icon: Rows3,
      label: t("lineItems.activeRows", { count: config.activeRows, size: config.seedSize }),
      value: config.activeRows * PRICES.activeRow[config.seedSize],
    },
    passiveRows > 0 && {
      icon: Rows3,
      label: t("lineItems.passiveRows", { count: passiveRows }),
      value: 0,
      included: true,
    },
    config.spraySystem && {
      icon: Droplets,
      label: t("lineItems.spraySystem"),
      value: priceBreakdown.spraySystem,
    },
    priceBreakdown.accessories > 0 && {
      icon: Package,
      label: t("lineItems.accessories"),
      value: priceBreakdown.accessories,
    },
    config.warrantyExtension && {
      icon: Shield,
      label: t("lineItems.warrantyExtension"),
      value: priceBreakdown.warrantyExtension,
    },
  ].filter(Boolean) as { icon: typeof Cpu; label: string; value: number; included?: boolean }[];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 py-6 md:py-8 pb-24">
        {/* Left: Visualization - Takes 3 columns */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Robot visualization */}
          <div className="flex-1 flex items-center justify-center py-4 md:py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg"
            >
              <svg viewBox="0 0 200 160" className="w-full h-auto">
                {/* Spray tank if enabled */}
                {config.spraySystem && (
                  <motion.g
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <rect x="70" y="8" width="60" height="22" rx="4" fill="#3b82f6" />
                    <text x="100" y="23" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                      110L
                    </text>
                  </motion.g>
                )}

                {/* Solar panels */}
                <rect x="30" y="30" width="140" height="18" rx="4" fill="#10b981" />
                {[0, 1, 2, 3].map((i) => (
                  <line key={i} x1={50 + i * 32} y1="30" x2={50 + i * 32} y2="48" stroke="#047857" strokeWidth="2" />
                ))}

                {/* Robot body */}
                <rect x="40" y="48" width="120" height="60" rx="8" fill="#059669" />

                {/* Display */}
                <rect x="70" y="58" width="60" height="25" rx="4" fill="#1f2937" />
                <motion.rect
                  x="75" y="63" width="50" height="15" rx="2" fill="#10b981" opacity="0.5"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Generator if hybrid */}
                {config.powerSource === "hybrid" && (
                  <motion.g
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <rect x="8" y="68" width="28" height="35" rx="3" fill="#6b7280" />
                    <rect x="12" y="72" width="20" height="8" rx="1" fill="#374151" />
                    <motion.rect
                      x="16" y="84" width="6" height="6" fill="#22c55e"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    <path d="M36 85 L48 85 L48 75" stroke="#f59e0b" strokeWidth="2" fill="none" />
                  </motion.g>
                )}

                {/* Spray arms if enabled */}
                {config.spraySystem && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <rect x="42" y="100" width="116" height="4" rx="2" fill="#60a5fa" />
                    {[0, 1, 2, 3, 4].map((i) => (
                      <g key={i}>
                        <circle cx={52 + i * 24} cy="108" r="4" fill="#3b82f6" />
                        <motion.path
                          d={`M${52 + i * 24} 112 L${47 + i * 24} 126 L${57 + i * 24} 126 Z`}
                          fill="#93c5fd"
                          opacity={0.5}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                        />
                      </g>
                    ))}
                  </motion.g>
                )}

                {/* Back Wheels */}
                <circle cx="60" cy="120" r="16" fill="#374151" />
                <circle cx="60" cy="120" r="9" fill="#6b7280" />
                <circle cx="140" cy="120" r="16" fill="#374151" />
                <circle cx="140" cy="120" r="9" fill="#6b7280" />

                {/* Front wheels based on config */}
                {config.frontWheel === "DFW" ? (
                  <>
                    <circle cx="60" cy="140" r="10" fill="#374151" />
                    <circle cx="60" cy="140" r="6" fill="#6b7280" />
                    <circle cx="140" cy="140" r="10" fill="#374151" />
                    <circle cx="140" cy="140" r="6" fill="#6b7280" />
                  </>
                ) : (
                  <>
                    <circle cx="100" cy="135" r="12" fill="#374151" />
                    <circle cx="100" cy="135" r="7" fill="#6b7280" />
                    {config.frontWheel === "AFW" && (
                      <motion.circle
                        cx="100" cy="135" r="4" fill="#f59e0b"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </>
                )}
              </svg>
            </motion.div>
          </div>

          {/* Config summary row */}
          <div className="flex justify-center gap-6 md:gap-8 pt-4 md:pt-6 border-t border-stone-100">
            <div className="text-center">
              <p className="text-xl md:text-2xl font-semibold text-stone-900">
                {config.activeRows}
                <span className="text-sm md:text-base font-normal text-stone-400 ml-0.5">{t("configLabels.rows")}</span>
              </p>
              <p className="text-xs text-stone-500 mt-0.5">{t("configLabels.active")}</p>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-semibold text-stone-900">
                {(workingWidth / 10).toFixed(0)}
                <span className="text-sm md:text-base font-normal text-stone-400 ml-0.5">cm</span>
              </p>
              <p className="text-xs text-stone-500 mt-0.5">{t("configLabels.workingWidth")}</p>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-semibold text-stone-900">
                {config.powerSource === "hybrid" ? t("configLabels.hybrid") : t("configLabels.solar")}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">{t("configLabels.power")}</p>
            </div>
          </div>
        </div>

        {/* Right: Configuration - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight">{t("title")}</h1>
            <p className="text-sm md:text-base text-stone-500 mt-1.5 md:mt-2">{t("subtitle")}</p>
          </div>

          {/* Price breakdown */}
          <div className="space-y-2 md:space-y-3">
            {lineItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between py-2 md:py-3 border-b border-stone-100 last:border-0 gap-3"
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <Icon className="h-4 w-4 text-stone-400 flex-shrink-0" />
                    <span className="text-sm md:text-base text-stone-700 truncate">{item.label}</span>
                  </div>
                  <span className="font-medium text-stone-900 text-sm md:text-base flex-shrink-0">
                    {item.included || item.value === 0 ? tCommon("included") : `+${formatPrice(item.value, config.currency)}`}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-base md:text-lg font-semibold text-stone-900">{t("total")}</span>
              <motion.span
                key={priceBreakdown.total}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-2xl md:text-3xl font-bold text-stone-900"
              >
                {formatPrice(priceBreakdown.total, config.currency)}
              </motion.span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs md:text-sm text-stone-500">
              <Truck className="h-4 w-4 flex-shrink-0" />
              <span>{t("delivery")}</span>
            </div>
          </div>

          {/* Annual Service Plan */}
          {config.servicePlan !== "none" && (
            <div className="pt-3 mt-3 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-teal-600" />
                  <span className="text-sm text-stone-700">
                    {t("carePlan", { plan: config.servicePlan === "standard" ? "Standard" : "Premium" })}
                  </span>
                </div>
                <div className="text-right">
                  {config.servicePlan === "premium" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-400 line-through">
                        {formatPrice(PRICES.servicePlan.premium, config.currency)}/yr
                      </span>
                      <span className="text-sm font-semibold text-teal-600">
                        {tCommon("freeFirstYear", { price: formatPrice(0, config.currency) })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-stone-900">
                      {formatPrice(PRICES.servicePlan.standard, config.currency)}/year
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 space-y-3">
            <button
              onClick={() => setShowEmailModal(true)}
              className="w-full h-12 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-700 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Mail className="h-5 w-5" />
              {tModals("emailQuote.title")}
            </button>

            <button
              onClick={() => setShowDealModal(true)}
              className="w-full h-12 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Building2 className="h-5 w-5" />
              {tModals("createDeal.createDeal")}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEmailModal && (
          <EmailQuoteModal
            isOpen={showEmailModal}
            onClose={() => setShowEmailModal(false)}
            config={config}
            priceBreakdown={priceBreakdown}
          />
        )}
        {showDealModal && (
          <CreateDealModal
            isOpen={showDealModal}
            onClose={() => setShowDealModal(false)}
            config={config}
            priceBreakdown={priceBreakdown}
          />
        )}
      </AnimatePresence>
    </>
  );
}
