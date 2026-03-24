import { cn } from "@/lib/utils/cn";

type BadgeVariant = "correct" | "wrong" | "unanswered" | "info";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  correct: "bg-exam-correct-light border-exam-correct-border text-exam-correct",
  wrong: "bg-exam-wrong-light border-exam-wrong-border text-exam-wrong",
  unanswered: "bg-exam-unanswered-light border-exam-unanswered-border text-exam-unanswered",
  info: "bg-accent-light border-line text-accent",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "px-3 py-1 rounded-full border",
        "text-base font-semibold",
        badgeStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
