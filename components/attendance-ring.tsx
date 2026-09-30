import { formatPct } from "@/lib/utils";

export function AttendanceRing({
  percentage,
  hex,
  strokeColor,
  size = 120,
  strokeWidth = 10,
  children,
}: {
  percentage: number;
  hex?: string;
  strokeColor?: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  const activeColor = hex || strokeColor || "#2563eb";
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <span className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            {formatPct(percentage)}
          </span>
        )}
      </div>
    </div>
  );
}
