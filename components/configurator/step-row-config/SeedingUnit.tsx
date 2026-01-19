// Seeding unit component - white hopper box with FARMDROID branding
// Real dimensions: 6mm hopper = 21cm wide, 14mm hopper = 24cm wide
// Using same scale as row visualization: pxPerMm = 0.22
// 21cm = 210mm * 0.22 = 46.2px, 24cm = 240mm * 0.22 = 52.8px
export function SeedingUnit({ seedSize }: { seedSize: "6mm" | "14mm" }) {
  const width = seedSize === "6mm" ? 46 : 53;  // 21cm and 24cm at 0.22 px/mm scale
  const height = seedSize === "6mm" ? 90 : 100;

  return (
    <g>
      {/* Main white hopper body with black outline */}
      <rect
        x={-width / 2}
        y={0}
        width={width}
        height={height}
        rx={6}
        fill="#ffffff"
        stroke="#1c1917"
        strokeWidth={1.5}
      />
      {/* Subtle shadow curve on right side */}
      <path
        d={`M${width / 2 - 4} 8 Q${width / 2 - 2} ${height / 2} ${width / 2 - 4} ${height - 8}`}
        fill="none"
        stroke="#e5e5e5"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* FARMDROID text - vertical */}
      <text
        x={0}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(-90, 0, ${height / 2})`}
        className="text-[8px] font-bold fill-[#1c1917] tracking-tight"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        FARMDR
        <tspan fill="#22c55e">O</tspan>
        ID
      </text>
    </g>
  );
}
