// Crop icon component for animated plants - shows emoji or seedling
export function CropIcon({ seedSize, emoji }: { seedSize: "6mm" | "14mm"; emoji?: string }) {
  const scale = seedSize === "6mm" ? 0.9 : 1.1;
  const fontSize = seedSize === "6mm" ? 14 : 18;

  // If emoji provided and not seedling, show emoji
  if (emoji && emoji !== "🌱") {
    return (
      <text
        fontSize={fontSize}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ userSelect: "none" }}
      >
        {emoji}
      </text>
    );
  }

  // Default seedling SVG
  return (
    <g transform={`scale(${scale}) translate(-12, -20)`}>
      {/* Left leaf */}
      <path d="M12 10a6 6 0 0 0 -6 -6h-3v2a6 6 0 0 0 6 6h3" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right leaf */}
      <path d="M12 14a6 6 0 0 1 6 -6h3v1a6 6 0 0 1 -6 6h-3" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Stem */}
      <path d="M12 20l0 -10" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}
