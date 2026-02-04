# Design System & Style Guide

A reusable design system reference extracted from the FarmDroid Configurator. Use this document to replicate the same look and feel across other projects.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| CSS Framework | Tailwind CSS | v4 |
| Component Library | shadcn/ui (New York style) | latest |
| Icons | Lucide React | v0.562+ |
| Animation | Framer Motion | v12+ |
| Font | Inter (Google Fonts) | variable |
| Color Space | OKLCH | -- |

### shadcn/ui Configuration (`components.json`)

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

---

## Color System

All colors use the **OKLCH** color space for perceptual uniformity.

### Light Mode (`:root`)

```css
:root {
  --background: oklch(1 0 0);             /* white */
  --foreground: oklch(0.145 0 0);         /* near-black */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);            /* charcoal */
  --primary-foreground: oklch(0.985 0 0); /* near-white */
  --secondary: oklch(0.97 0 0);           /* light gray */
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);   /* medium gray */
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325); /* red */
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}
```

### Dark Mode (`.dark`)

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}
```

### Semantic Accent Colors (Tailwind)

| Purpose | Color | Class |
|---------|-------|-------|
| Success / Selection | Emerald 500 | `text-emerald-500`, `border-emerald-500`, `ring-emerald-500` |
| Error / Destructive | Red 500 | `text-red-500` |
| Warning | Amber 500 | `text-amber-500` |
| Info | Blue 500 | `text-blue-500` |
| Neutral surface | Stone 50 | `bg-stone-50` |
| Neutral border | Stone 200 | `border-stone-200` |

### Chart Colors

```css
/* Light */
--chart-1: oklch(0.646 0.222 41.116);  /* orange */
--chart-2: oklch(0.6 0.118 184.704);   /* teal */
--chart-3: oklch(0.398 0.07 227.392);  /* dark blue */
--chart-4: oklch(0.828 0.189 84.429);  /* yellow-green */
--chart-5: oklch(0.769 0.188 70.08);   /* gold */

/* Dark */
--chart-1: oklch(0.488 0.243 264.376); /* blue */
--chart-2: oklch(0.696 0.17 162.48);   /* teal */
--chart-3: oklch(0.769 0.188 70.08);   /* gold */
--chart-4: oklch(0.627 0.265 303.9);   /* purple */
--chart-5: oklch(0.645 0.246 16.439);  /* red-orange */
```

---

## Typography

### Font Stack

```css
font-family: var(--font-inter), system-ui, sans-serif;
```

Load **Inter** from Google Fonts as a variable font, latin subset, with `font-display: swap`.

### Scale

| Element | Size | Weight | Leading |
|---------|------|--------|---------|
| Body (mobile) | `text-base` (16px) | 400 | default |
| Body (md+) | `text-sm` (14px) | 400 | default |
| Small text | `text-sm` (14px) | 400 | default |
| Extra small | `text-xs` (12px) | 400 | default |
| Labels | `text-sm` | 500 (`font-medium`) | `leading-none` |
| Headings | varies | 600 (`font-semibold`) | default |
| Dialog titles | `text-lg` | 600 (`font-semibold`) | `leading-none` |
| Buttons | `text-sm` | 500 (`font-medium`) | default |

### Rendering

```css
body {
  -webkit-font-smoothing: antialiased; /* Tailwind: antialiased */
}
```

---

## Border Radius

Base: `--radius: 0.625rem` (10px)

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 6px | Small elements |
| `rounded-md` | 8px | Inputs, buttons |
| `rounded-lg` | 10px | Base radius |
| `rounded-xl` | 14px | Cards |
| `rounded-full` | 9999px | Badges, pills |

```css
--radius-sm: calc(var(--radius) - 4px);   /* 6px */
--radius-md: calc(var(--radius) - 2px);   /* 8px */
--radius-lg: var(--radius);               /* 10px */
--radius-xl: calc(var(--radius) + 4px);   /* 14px */
--radius-2xl: calc(var(--radius) + 8px);  /* 18px */
```

---

## Shadows

| Token | Usage |
|-------|-------|
| `shadow-xs` | Inputs, subtle depth |
| `shadow-sm` | Cards, selected items |
| `shadow-md` | Hover states, elevated cards |
| `shadow-lg` | Modals, dropdowns, toasts |
| `shadow-lg backdrop-blur-sm` | Frosted glass toast |

---

## Spacing

Consistent spacing scale used throughout:

| Gap/Padding | Pixels | Common usage |
|-------------|--------|-------------|
| `gap-1` / `p-1` | 4px | Tight groupings |
| `gap-1.5` / `p-1.5` | 6px | Tab triggers, small buttons |
| `gap-2` / `p-2` | 8px | Form items, table cells |
| `gap-3` / `p-3` | 12px | Icon + text groups |
| `gap-4` / `p-4` | 16px | Section padding |
| `gap-6` / `p-6` | 24px | Card padding, major sections |

---

## Component Patterns

### Buttons

Sizes: `h-9` (default), `h-8` (sm), `h-10` (lg), `size-9` (icon)

| Variant | Style |
|---------|-------|
| Default | `bg-primary text-primary-foreground hover:bg-primary/90` |
| Secondary | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| Destructive | `bg-destructive text-white hover:bg-destructive/90` |
| Outline | `border border-input bg-background hover:bg-accent` |
| Ghost | `hover:bg-accent hover:text-accent-foreground` |
| Link | `text-primary underline-offset-4 hover:underline` |

All buttons: `rounded-md`, `text-sm font-medium`, `transition-all`, focus ring with `ring-offset-2`.

### Cards

```
rounded-xl shadow-sm border
padding: py-6 px-6
gap: gap-6 (flex-col)
```

**Hover variant** (`.card-hover`):
```css
transition-all duration-200 ease-out
hover: -translate-y-0.5 shadow-md
```

### Selection Cards

```css
/* Base */
.selection-card { transition-all duration-200 ease-out; }

/* Selected */
.selection-card.selected {
  border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20
}

/* Disabled */
.selection-card.disabled { opacity-60 cursor-not-allowed; }
```

### Inputs

```
h-9, px-3 py-1, rounded-md, shadow-xs
border-input, bg-transparent
focus: ring-2 ring-emerald-500 border-emerald-500
dark: bg-input/30, hover:bg-input/50
placeholder: text-muted-foreground
disabled: opacity-50 cursor-not-allowed
transition-[color,box-shadow]
```

### Badges

```
rounded-full, px-2 py-0.5, text-xs, w-fit
variants: default, secondary, destructive, outline
icon gap: gap-1
```

### Dialogs / Modals

```
overlay: fixed inset-0 z-50 bg-black/50
content: rounded-lg shadow-lg max-w-[calc(100%-2rem)]
animation: fade-in-0 zoom-in-95, duration-200
close: absolute top-4 right-4, opacity-70
title: text-lg font-semibold leading-none
```

### Tables

```
cell: p-2, text-sm
header: h-10, font-medium, text-muted-foreground
row hover: hover:bg-muted/50
row border: border-b
```

### Tabs

```
list: h-9, rounded-lg, bg-muted, p-1
trigger: rounded-md, px-2 py-1, text-sm
active: bg-background shadow-sm
gap: gap-1.5
transition-[color,box-shadow]
```

### Toasts

```
rounded-xl, p-4, shadow-lg backdrop-blur-sm
min-w-[300px], max-w-[420px]
enter/exit: scale + translateY animation
```

### Alerts

```
rounded-lg, px-4 py-3, text-sm, border
variants: default (card bg), destructive (red)
icon: size-4, grid layout
```

### Switches

```
h-[1.15rem], w-8, rounded-full, shadow-xs
thumb: size-4, rounded-full
transitions: transition-all, transition-transform
```

---

## Focus & Interaction States

### Focus Ring (Global)

```css
*:focus-visible {
  outline: none;
  ring: 2px;
  ring-color: emerald-500;
  ring-offset: 2px;
}

input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: none;
  ring: 2px;
  ring-color: emerald-500;
  border-color: emerald-500;
}
```

### Disabled

```css
opacity-50 cursor-not-allowed
```

### Invalid (aria-invalid)

```css
ring-color: destructive/20 (light) | destructive/40 (dark)
```

---

## Animations

### Keyframes

```css
/* Fade in from below */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Usage: animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards */

/* Simple fade */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Usage: animation: fadeIn 0.4s ease-out forwards */

/* Selection checkmark bounce */
@keyframes checkmark-pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
/* Usage: animation: checkmark-pop 0.2s ease-out forwards */

/* Horizontal wiggle hint */
@keyframes drag-hint-wiggle {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-8px); }
  20% { transform: translateX(8px); }
  30% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  50% { transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  70% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
  90% { transform: translateX(0); }
}
/* Usage: animation: drag-hint-wiggle 1.5s ease-in-out */
```

### Transition Defaults

| Property | Duration | Easing |
|----------|----------|--------|
| UI interactions | 200ms | `ease-out` |
| Quick feedback | 100ms | `ease-out` |
| Slower animations | 300ms | `ease-in-out` |
| Bounce/spring | -- | `cubic-bezier(0.16, 1, 0.3, 1)` |

### Framer Motion

Used for complex component animations (lists, layout shifts, page transitions):
- `AnimatePresence` for enter/exit
- `motion.div` with `initial`, `animate`, `exit` props
- Stagger delays for list items

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Layout

### Page Background

```css
body { background: stone-50; } /* bg-stone-50 */
```

### Responsive Breakpoints

| Prefix | Min-width | Usage |
|--------|-----------|-------|
| `sm:` | 640px | Stack to row, dialog widths |
| `md:` | 768px | Text size reduction, layout shifts |
| `lg:` | 1024px | Wide layouts |

### Common Flex Patterns

```
/* Row with space between */
flex items-center justify-between

/* Column stack */
flex flex-col gap-4

/* Responsive stack-to-row */
flex flex-col sm:flex-row gap-3
```

### Grid

```
/* Card header */
grid grid-cols-[1fr_auto] gap-2

/* Auto-sizing rows */
grid auto-rows-min
```

---

## Scrollbar

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.18); }
```

---

## Icons

**Library:** Lucide React

| Size class | Pixels | Usage |
|------------|--------|-------|
| `size-3` | 12px | Inline indicators |
| `size-4` | 16px | Standard icon size |
| `size-5` | 20px | Larger UI icons |

Standard icon props:
```tsx
<Icon className="size-4 shrink-0 pointer-events-none" />
```

Color by context:
- Default: `text-current`
- Muted: `text-muted-foreground opacity-50`
- Success: `text-emerald-500`
- Error: `text-red-500`
- Warning: `text-amber-500`
- Info: `text-blue-500`

---

## Dark Mode Implementation

Toggle via `.dark` class on root element. All semantic colors swap automatically through CSS variables. Additional dark-specific overrides:

```
/* Input backgrounds */
dark:bg-input/30
dark:hover:bg-input/50

/* Borders */
dark:border-input
dark:border-stone-700

/* Base border */
* { border-color: stone-200; } /* light */
/* dark uses border variable (white 10% opacity) */
```

---

## Quick Setup Checklist

1. Install dependencies:
   ```
   tailwindcss @tailwindcss/postcss postcss
   tailwind-merge clsx class-variance-authority
   lucide-react framer-motion
   ```
2. Initialize shadcn/ui with `new-york` style, `neutral` base color, `lucide` icons
3. Load **Inter** font (Google Fonts, variable, latin)
4. Copy the CSS variables from the Color System section into `globals.css`
5. Copy the keyframe animations and utility classes
6. Set body: `bg-stone-50 text-foreground antialiased`
7. Set global focus ring: `ring-2 ring-emerald-500 ring-offset-2`
8. Apply the scrollbar styles
9. Add reduced motion media query
