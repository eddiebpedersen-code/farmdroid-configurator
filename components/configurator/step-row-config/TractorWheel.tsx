// Tractor wheel component - top-down view with chevron tread pattern
// Shows rotating tread pattern when animating
export function TractorWheel({
  width,
  height,
  isAnimating,
  robotSpeed,
  isHovered,
  isDragging
}: {
  width: number;
  height: number;
  isAnimating: boolean;
  robotSpeed: number;
  isHovered?: boolean;
  isDragging?: boolean;
}) {
  const baseColor = isDragging || isHovered ? "#a8a29e" : "#57534e";
  const darkColor = isDragging || isHovered ? "#78716c" : "#44403c";
  const treadColor = isDragging || isHovered ? "#d6d3d1" : "#a8a29e";

  // Animation duration based on robot speed (faster speed = faster rotation)
  const animDuration = 400 / robotSpeed; // ~0.42s at 950m/h, ~0.67s at 600m/h

  // Tread pattern spacing
  const treadSpacing = 10;
  const treadCount = Math.ceil(height / treadSpacing) + 4; // Extra for seamless loop

  return (
    <g>
      {/* Wheel base/sidewall */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={4}
        fill={baseColor}
      />

      {/* Inner tread area with clip */}
      <defs>
        <clipPath id={`tread-clip-${width}-${height}`}>
          <rect x={3} y={2} width={width - 6} height={height - 4} rx={2} />
        </clipPath>
      </defs>

      {/* Tread surface */}
      <rect
        x={3}
        y={2}
        width={width - 6}
        height={height - 4}
        rx={2}
        fill={darkColor}
      />

      {/* Animated tread pattern - chevron/herringbone lugs */}
      <g clipPath={`url(#tread-clip-${width}-${height})`}>
        <g
          style={{
            animation: isAnimating ? `wheelTread ${animDuration.toFixed(3)}s linear infinite` : "none",
          }}
        >
          {Array.from({ length: treadCount }).map((_, i) => {
            const y = i * treadSpacing - treadSpacing * 2;
            const centerX = width / 2;
            return (
              <g key={i}>
                {/* Left chevron lug */}
                <path
                  d={`M${centerX - 1} ${y} L${4} ${y + 4} L${4} ${y + 6} L${centerX - 1} ${y + 2} Z`}
                  fill={treadColor}
                />
                {/* Right chevron lug */}
                <path
                  d={`M${centerX + 1} ${y} L${width - 4} ${y + 4} L${width - 4} ${y + 6} L${centerX + 1} ${y + 2} Z`}
                  fill={treadColor}
                />
              </g>
            );
          })}
        </g>
      </g>

      {/* Side grooves for 3D effect */}
      <line x1={2} y1={4} x2={2} y2={height - 4} stroke={darkColor} strokeWidth={1} />
      <line x1={width - 2} y1={4} x2={width - 2} y2={height - 4} stroke={darkColor} strokeWidth={1} />
    </g>
  );
}
