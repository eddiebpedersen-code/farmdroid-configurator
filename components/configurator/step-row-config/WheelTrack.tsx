// Wheel track component - shows tire marks in soil
export function WheelTrack({
  x,
  y,
  width,
  trackLength,
  isAnimating,
  robotSpeed,
  id,
}: {
  x: number;
  y: number;
  width: number;
  trackLength: number;
  isAnimating: boolean;
  robotSpeed: number;
  id: string;
}) {
  const treadSpacing = 10;

  // Calculate global offset to align patterns across all tracks
  // Start pattern from a fixed global position (0) so all tracks align
  const globalOffset = y % treadSpacing;
  const startY = y - globalOffset - treadSpacing * 2;
  const trackCount = Math.ceil((trackLength + globalOffset + treadSpacing * 4) / treadSpacing);

  return (
    <g>
      <defs>
        <clipPath id={`track-clip-${id}`}>
          <rect x={x} y={y} width={width} height={trackLength} />
        </clipPath>
      </defs>

      {/* Track marks in soil */}
      <g clipPath={`url(#track-clip-${id})`}>
        <g
          style={{
            animation: isAnimating ? `soilScroll ${(800 / robotSpeed).toFixed(3)}s linear infinite` : "none",
          }}
        >
          {Array.from({ length: trackCount }).map((_, i) => {
            const trackY = startY + i * treadSpacing;
            const centerX = x + width / 2;
            return (
              <g key={i} opacity={0.4}>
                {/* Left track impression - chevrons pointing up (opposite to driving direction) */}
                <path
                  d={`M${centerX - 1} ${trackY + 6} L${x + 3} ${trackY + 2} L${x + 3} ${trackY} L${centerX - 1} ${trackY + 4} Z`}
                  fill="#57534e"
                />
                {/* Right track impression - chevrons pointing up (opposite to driving direction) */}
                <path
                  d={`M${centerX + 1} ${trackY + 6} L${x + width - 3} ${trackY + 2} L${x + width - 3} ${trackY} L${centerX + 1} ${trackY + 4} Z`}
                  fill="#57534e"
                />
              </g>
            );
          })}
        </g>
      </g>
    </g>
  );
}
