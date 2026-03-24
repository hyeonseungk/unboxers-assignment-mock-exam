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
    if (!examStartedAt) {
      setRemainingSeconds(timeLimitSeconds);
      return;
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - examStartedAt) / 1000);
      const remaining = Math.max(0, timeLimitSeconds - elapsed);
      setRemainingSeconds(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [examStartedAt, timeLimitSeconds]);

  const percent = (remainingSeconds / timeLimitSeconds) * 100;
  const isWarning = remainingSeconds <= WARNING_THRESHOLD && remainingSeconds > 0;
  const isExpired = remainingSeconds <= 0 && examStartedAt !== null;

  return {
    remainingSeconds,
    formattedTime: formatTimer(remainingSeconds),
    percent,
    isWarning,
    isExpired,
  };
}
