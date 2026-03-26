import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { Check, Minus, Percent, X } from "lucide-react";
import type { StudentInfo } from "@/lib/types/exam";
import { cn } from "@/lib/utils/cn";

interface ResultScoreCardProps {
  title: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  studentInfo?: StudentInfo | null;
}

function useCountUp(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frameId: number;

    const step = (now: number, start: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame((nextNow) => step(nextNow, start));
      }
    };

    frameId = requestAnimationFrame((now) => {
      if (target === 0) {
        setCount(0);
        return;
      }

      step(now, now);
    });

    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return count;
}

function getScoreTone(score: number) {
  if (score >= 70) {
    return {
      scoreClassName: "text-[#10986c]",
    };
  }

  if (score >= 40) {
    return {
      scoreClassName: "text-[#3d71db]",
    };
  }

  return {
    scoreClassName: "text-[#d55145]",
  };
}

export function ResultScoreCard({
  title,
  score,
  correctCount,
  wrongCount,
  unansweredCount,
  studentInfo,
}: ResultScoreCardProps) {
  const displayScore = useCountUp(score);
  const totalQuestions = correctCount + wrongCount + unansweredCount;
  const accuracy = totalQuestions
    ? Math.round((correctCount / totalQuestions) * 100)
    : 0;
  const scoreTone = getScoreTone(score);

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#ebe4d9] bg-[linear-gradient(135deg,#fffdfa_0%,#fff8f1_48%,#ffffff_100%)] p-6 shadow-[0_18px_44px_rgba(23,23,23,0.08)] animate-scale-in sm:p-8">
      <div className="pointer-events-none absolute -right-16 top-[-92px] h-[220px] w-[220px] rounded-full bg-[#f1ebe2]" />
      <div className="pointer-events-none absolute left-[44%] top-[18px] h-[140px] w-[140px] rounded-full bg-[#edf4ff] blur-3xl" />

      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_340px]">
        <div className="min-w-0">
          <h1 className="text-[30px] font-black leading-[1.12] tracking-[-0.06em] text-[#111111] sm:text-[36px]">
            {title}
          </h1>

          {studentInfo && (
            <p className="mt-4 text-[15px] font-semibold leading-relaxed text-[#5a5752] sm:text-[16px]">
              {studentInfo.name} · {studentInfo.school} · {studentInfo.grade}학년 ·{" "}
              {studentInfo.seatNumber}번 자리
            </p>
          )}

          <div className="mt-7 flex items-end gap-3">
            <span
              className={cn(
                "text-[74px] font-black leading-none tracking-[-0.09em] tabular-nums sm:text-[96px]",
                scoreTone.scoreClassName,
              )}
            >
              {displayScore}
            </span>
            <div className="pb-2 sm:pb-3">
              <p className="text-[26px] font-black leading-none tracking-[-0.05em] text-[#111111] sm:text-[30px]">
                점
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
          <MetricCard
            icon={Percent}
            label="정답률"
            value={`${accuracy}%`}
            toneClassName="border-[#d8e5ff] bg-[#f5f8ff] text-[#325eb8]"
          />
          <MetricCard
            icon={Check}
            label="정답"
            value={`${correctCount}문항`}
            toneClassName="border-[#c7eadb] bg-[#f1fbf5] text-[#11855e]"
          />
          <MetricCard
            icon={X}
            label="오답"
            value={`${wrongCount}문항`}
            toneClassName="border-[#f0d3cf] bg-[#fff6f4] text-[#c94d43]"
          />
          <MetricCard
            icon={Minus}
            label="미답"
            value={`${unansweredCount}문항`}
            toneClassName="border-[#eee4d5] bg-[#faf7f1] text-[#8e826f]"
          />
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  toneClassName,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  toneClassName: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border p-4 shadow-[0_10px_24px_rgba(17,17,17,0.04)]",
        toneClassName,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold tracking-[-0.01em]">{label}</span>
        <span className="inline-flex size-9 items-center justify-center rounded-full border border-current/15 bg-white/70">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-4 text-[28px] font-black leading-none tracking-[-0.05em] tabular-nums">
        {value}
      </p>
    </div>
  );
}
