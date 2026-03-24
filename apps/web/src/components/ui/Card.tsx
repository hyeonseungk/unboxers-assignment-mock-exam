import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-line rounded-2xl p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
