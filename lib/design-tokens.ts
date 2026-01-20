/**
 * Design Tokens for FarmDroid Configurator
 * Centralized design system constants for consistency
 */

// =============================================================================
// SPACING SCALE (based on 4px grid)
// =============================================================================
export const spacing = {
  0: "0",
  1: "0.25rem",   // 4px
  2: "0.5rem",    // 8px
  3: "0.75rem",   // 12px
  4: "1rem",      // 16px
  5: "1.25rem",   // 20px
  6: "1.5rem",    // 24px
  8: "2rem",      // 32px
  10: "2.5rem",   // 40px
  12: "3rem",     // 48px
  16: "4rem",     // 64px
} as const;

// =============================================================================
// ANIMATION TIMING
// =============================================================================
export const animation = {
  duration: {
    instant: "0ms",
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
    slower: "600ms",
  },
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;

// Framer Motion spring configs
export const springConfig = {
  gentle: { stiffness: 120, damping: 14 },
  default: { stiffness: 260, damping: 20 },
  stiff: { stiffness: 400, damping: 35 },
  bouncy: { stiffness: 400, damping: 10 },
} as const;

// =============================================================================
// BUTTON SIZES (minimum 44px touch target for accessibility)
// =============================================================================
export const buttonSize = {
  xs: "h-8 min-w-[32px] px-2 text-xs",       // 32px - icon only
  sm: "h-9 min-w-[36px] px-3 text-sm",       // 36px
  md: "h-11 min-w-[44px] px-4 text-base",    // 44px - default, touch-friendly
  lg: "h-12 min-w-[48px] px-6 text-base",    // 48px
  xl: "h-14 min-w-[56px] px-8 text-lg",      // 56px
} as const;

// Icon button sizes (square, touch-friendly)
export const iconButtonSize = {
  sm: "h-9 w-9",    // 36px
  md: "h-11 w-11",  // 44px - default, touch-friendly
  lg: "h-12 w-12",  // 48px
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================
export const radius = {
  none: "rounded-none",
  sm: "rounded",         // 4px
  md: "rounded-md",      // 6px
  lg: "rounded-lg",      // 8px - default for cards
  xl: "rounded-xl",      // 12px - modals, large cards
  full: "rounded-full",  // pill/circle
} as const;

// =============================================================================
// SHADOWS (elevation system)
// =============================================================================
export const shadow = {
  none: "shadow-none",
  sm: "shadow-sm",                    // subtle lift
  md: "shadow-md",                    // cards
  lg: "shadow-lg",                    // dropdowns, tooltips
  xl: "shadow-xl",                    // modals
  "2xl": "shadow-2xl",                // overlays
  inner: "shadow-inner",              // inset elements
} as const;

// =============================================================================
// COLORS (semantic naming)
// =============================================================================
export const colors = {
  // Primary actions
  primary: {
    default: "bg-stone-900 text-white",
    hover: "hover:bg-stone-800",
    active: "active:bg-stone-700",
    disabled: "bg-stone-300 text-stone-500",
  },
  // Secondary actions
  secondary: {
    default: "bg-white text-stone-700 border border-stone-200",
    hover: "hover:bg-stone-50 hover:border-stone-300",
    active: "active:bg-stone-100",
    disabled: "bg-stone-50 text-stone-400 border-stone-200",
  },
  // Success/confirmation
  success: {
    default: "bg-emerald-500 text-white",
    hover: "hover:bg-emerald-600",
    light: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  // Warning/caution
  warning: {
    default: "bg-amber-500 text-white",
    hover: "hover:bg-amber-600",
    light: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  // Error/danger
  error: {
    default: "bg-red-500 text-white",
    hover: "hover:bg-red-600",
    light: "bg-red-50 text-red-700 border border-red-200",
  },
  // Info
  info: {
    default: "bg-blue-500 text-white",
    hover: "hover:bg-blue-600",
    light: "bg-blue-50 text-blue-700 border border-blue-200",
  },
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================
export const zIndex = {
  base: "z-0",
  dropdown: "z-10",
  sticky: "z-20",
  fixed: "z-30",
  modalBackdrop: "z-40",
  modal: "z-50",
  popover: "z-60",
  tooltip: "z-70",
  toast: "z-80",
  max: "z-[9999]",
} as const;

// =============================================================================
// FOCUS STYLES (accessibility)
// =============================================================================
export const focus = {
  // Default focus ring
  ring: "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
  // Focus within for containers
  within: "focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2",
  // No focus ring (for custom handling)
  none: "focus:outline-none",
} as const;

// =============================================================================
// TRANSITION PRESETS
// =============================================================================
export const transition = {
  // Default transition for most elements
  default: "transition-all duration-200 ease-out",
  // Fast transitions for micro-interactions
  fast: "transition-all duration-150 ease-out",
  // Slow transitions for larger elements
  slow: "transition-all duration-300 ease-out",
  // Color only transitions
  colors: "transition-colors duration-200 ease-out",
  // Transform transitions
  transform: "transition-transform duration-200 ease-out",
  // Opacity transitions
  opacity: "transition-opacity duration-200 ease-out",
} as const;

// =============================================================================
// DISABLED STATES
// =============================================================================
export const disabled = {
  // Standard disabled styling
  default: "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  // More visible disabled state
  obvious: "disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-200 disabled:cursor-not-allowed",
} as const;

// =============================================================================
// COMMON COMPONENT CLASSES
// =============================================================================
export const components = {
  // Card styles
  card: {
    base: "bg-white rounded-xl border border-stone-200 shadow-sm",
    interactive: "bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 cursor-pointer",
    selected: "bg-white rounded-xl border-2 border-emerald-500 shadow-md",
  },
  // Input styles
  input: {
    base: "w-full px-4 py-3 rounded-lg border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200",
    error: "border-red-300 focus:ring-red-500 focus:border-red-500",
  },
  // Badge styles
  badge: {
    default: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    neutral: "bg-stone-100 text-stone-800",
  },
} as const;

// =============================================================================
// TOUCH TARGETS
// =============================================================================
export const touchTarget = {
  // Minimum touch target size (44x44px per WCAG)
  min: "min-h-[44px] min-w-[44px]",
  // Extended touch area (invisible, larger hit box)
  extended: "relative after:absolute after:inset-[-8px] after:content-['']",
} as const;
