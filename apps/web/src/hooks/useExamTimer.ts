import { useState, useEffect } from "react";
import { useExamStore } from "@/stores/useExamStore";
import { formatTimer } from "@/lib/utils/format";

const WARNING_THRESHOLD = 30;

interface UseExamTimerReturn {
  remainingSeconds: number;
  formattedTime: string;
  percent: number;
  isWarning: boolean;
  isExpired: boolean;
}

export function useExamTimer(timeLimitSeconds: number): UseExamTimerReturn {
  const examStartedAt = useExamStore((s) => s.examStartedAt);
  const [remainingSeconds, setRemainingSeconds] = useState(timeLimitSeconds);

  useEffect(() => {
    if (!examStartedAt) return;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - examStartedAt) / 1000);
      const remaining = Math.max(0, timeLimitSeconds - elapsed);
      setRemainingSeconds(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [examStartedAt, timeLimitSeconds]);

  const activeRemainingSeconds = examStartedAt ? remainingSeconds : timeLimitSeconds;
  const percent = (activeRemainingSeconds / timeLimitSeconds) * 100;
  const isWarning =
    activeRemainingSeconds <= WARNING_THRESHOLD && activeRemainingSeconds > 0;
  const isExpired = activeRemainingSeconds <= 0 && examStartedAt !== null;

  return {
    remainingSeconds: activeRemainingSeconds,
    formattedTime: formatTimer(activeRemainingSeconds),
    percent,
    isWarning,
    isExpired,
  };
}
