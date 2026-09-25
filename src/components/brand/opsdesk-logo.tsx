type OpsDeskLogoProps = {
  size?: number;
  showWordmark?: boolean;
  subtitle?: boolean;
  className?: string;
};

export function OpsDeskLogo({
  size = 40,
  showWordmark = true,
  subtitle = false,
  className = "",
}: OpsDeskLogoProps) {
  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="OpsDesk"
        role="img"
        className="shrink-0"
      >
        <defs>
          <linearGradient
            id="opsdesk-gradient"
            x1="8"
            y1="4"
            x2="58"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8174FF" />
            <stop offset="1" stopColor="#5A49E8" />
          </linearGradient>
        </defs>

        <rect
          width="64"
          height="64"
          rx="18"
          fill="url(#opsdesk-gradient)"
        />

        <circle
          cx="24"
          cy="32"
          r="10"
          stroke="white"
          strokeWidth="5"
        />

        <path
          d="M36 20H40C48.8366 20 56 25.3726 56 32C56 38.6274 48.8366 44 40 44H36V20Z"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M34 32H40"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <div className="leading-none">
          <p className="text-[15px] font-semibold tracking-[-0.02em]">
            OpsDesk
          </p>

          {subtitle && (
            <p className="mt-1 text-[9px] font-medium tracking-wide opacity-45">
              Operations Platform
            </p>
          )}
        </div>
      )}
    </div>
  );
}