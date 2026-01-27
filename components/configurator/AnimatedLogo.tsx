"use client";

import { motion } from "framer-motion";

export function AnimatedLogo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-auto">
        {/* Main U shape / smile */}
        <path
          d="M15 35
             C15 35, 8 45, 10 60
             C12 75, 25 90, 50 90
             C75 90, 88 75, 90 60
             C92 45, 85 35, 85 35"
          fill="none"
          stroke="#4ade80"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Center stem */}
        <rect x="45" y="40" width="10" height="30" rx="5" fill="#4ade80" />

        {/* Left leaf (the blinking one) */}
        <motion.g
          animate={{
            scaleY: [1, 0.1, 1],
          }}
          transition={{
            duration: 0.15,
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatDelay: 3,
            delay: 2,
          }}
          style={{ transformOrigin: "30px 20px" }}
        >
          <path
            d="M50 28
               C45 25, 35 15, 22 12
               C15 10, 10 15, 12 22
               C15 32, 30 35, 45 30"
            fill="#4ade80"
          />
          {/* Left leaf vein */}
          <path
            d="M38 18 C35 20, 28 22, 22 20"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>

        {/* Right leaf (static) */}
        <g>
          <path
            d="M50 28
               C55 25, 65 15, 78 12
               C85 10, 90 15, 88 22
               C85 32, 70 35, 55 30"
            fill="#4ade80"
          />
          {/* Right leaf vein */}
          <path
            d="M62 18 C65 20, 72 22, 78 20"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
