"use client";

import { useMode } from "@/contexts/ModeContext";
import { formatPrice, Currency } from "@/lib/configurator-data";

interface PriceProps {
  amount: number;
  currency?: Currency;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * Price component that conditionally renders based on mode.
 * In public mode, returns null (hides prices).
 * In partner mode, shows the formatted price.
 */
export function Price({ amount, currency = "EUR", className, prefix = "", suffix = "" }: PriceProps) {
  const { showPrices } = useMode();

  if (!showPrices) return null;

  return (
    <span className={className}>
      {prefix}{formatPrice(amount, currency)}{suffix}
    </span>
  );
}

/**
 * Price display that shows a placeholder in public mode.
 * Useful when you need to maintain layout spacing.
 */
export function PriceWithPlaceholder({
  amount,
  currency = "EUR",
  className,
  placeholder = "—",
  prefix = "",
  suffix = ""
}: PriceProps & { placeholder?: string }) {
  const { showPrices } = useMode();

  if (!showPrices) {
    return <span className={className}>{placeholder}</span>;
  }

  return (
    <span className={className}>
      {prefix}{formatPrice(amount, currency)}{suffix}
    </span>
  );
}
