import { cn } from "@/lib/utils/cn";

type ProgressVariant = "default" | "warning" | "danger";

interface ProgressBarProps {
  /** 0-100 사이의 퍼센트 값 */
  percent: number;
  variant?: ProgressVariant;
  className?: string;
}

const barVariantStyles: Record<ProgressVariant, string> = {
  default: "bg-timer-bar",
  warning: "bg-timer-warning",
  danger: "bg-timer-danger",
};

export function ProgressBar({
  percent,
  variant = "default",
  className,
}: ProgressBarProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent));

  return (
    <div
      className={cn("h-2 w-full rounded-full bg-timer-bar-track", className)}
      role="progressbar"
      aria-valuenow={clampedPercent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-linear",
          barVariantStyles[variant],
        )}
        style={{ width: `${clampedPercent}%` }}
      />
    </div>
  );
}
