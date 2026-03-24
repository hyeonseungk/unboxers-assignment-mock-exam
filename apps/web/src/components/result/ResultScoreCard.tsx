import { useState, useEffect } from "react";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface ResultScoreCardProps {
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
}

function useCountUp(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    const start = performance.now();
    let frameId: number;
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return count;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-score-high";
  if (score >= 40) return "text-score-mid";
  return "text-score-low";
}

export function ResultScoreCard({
  score,
  correctCount,
  wrongCount,
  unansweredCount,
}: ResultScoreCardProps) {
  const displayScore = useCountUp(score);

  return (
    <Card className="text-center py-8 animate-scale-in">
      <p
        className={cn(
          "text-6xl font-bold tabular-nums",
          getScoreColor(score),
        )}
      >
        {displayScore}점
      </p>
      <p className="text-lg text-fg-secondary mt-2">100점 만점</p>

      {/* Score bar */}
      <div className="mt-5 mx-auto max-w-xs">
        <div className="h-3 rounded-full bg-score-bar-bg overflow-hidden">
          <div
            className="h-full rounded-full bg-score-bar transition-all duration-1000 ease-out"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Badge variant="correct">정답 {correctCount}개</Badge>
        <Badge variant="wrong">오답 {wrongCount}개</Badge>
        <Badge variant="unanswered">미답 {unansweredCount}개</Badge>
      </div>
    </Card>
  );
}
