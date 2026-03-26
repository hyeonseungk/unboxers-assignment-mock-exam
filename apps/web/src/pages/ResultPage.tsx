import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useExamStore } from "@/stores/useExamStore";
import type { ExamSubmitResponse, ResultPageState } from "@/lib/types/exam";
import { SubmitCompleteView } from "@/components/result/SubmitCompleteView";
import { ScanAnimationView } from "@/components/result/ScanAnimationView";
import { ResultScoreCard } from "@/components/result/ResultScoreCard";
import { ResultItemGrid } from "@/components/result/ResultItemGrid";
import { ResultActions } from "@/components/result/ResultActions";

type ResultPhase = "complete" | "scanning" | "result";

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetExam = useExamStore((s) => s.resetExam);
  const navigationState = location.state as ExamSubmitResponse | ResultPageState | null;
  const resultData =
    navigationState && "resultData" in navigationState
      ? navigationState.resultData
      : navigationState;
  const submitMode =
    navigationState && "resultData" in navigationState
      ? navigationState.submitMode ?? "manual"
      : "manual";

  const [phase, setPhase] = useState<ResultPhase>(
    submitMode === "timeout" ? "scanning" : "complete",
  );

  // No result data → redirect to home
  useEffect(() => {
    if (!resultData) {
      navigate("/", { replace: true });
    }
  }, [resultData, navigate]);

  // Auto-transition from scanning to result after 3s
  useEffect(() => {
    if (phase !== "scanning") return;
    const timer = setTimeout(() => setPhase("result"), 3000);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleShowResult = useCallback(() => {
    setPhase("scanning");
  }, []);

  const handleRetry = useCallback(() => {
    resetExam();
    navigate("/");
  }, [resetExam, navigate]);

  const handleGoHome = useCallback(() => {
    resetExam();
    navigate("/");
  }, [resetExam, navigate]);

  if (!resultData) return null;

  return (
    <div className="h-dvh w-dvw overflow-hidden bg-background">
      {phase === "complete" && (
        <SubmitCompleteView onShowResult={handleShowResult} />
      )}

      {phase === "scanning" && <ScanAnimationView />}

      {phase === "result" && (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              <ResultScoreCard
                score={resultData.score}
                correctCount={resultData.correctCount}
                wrongCount={resultData.wrongCount}
                unansweredCount={resultData.unansweredCount}
              />
              <ResultItemGrid results={resultData.results} />
            </div>
          </div>
          <ResultActions onRetry={handleRetry} onGoHome={handleGoHome} />
        </div>
      )}
    </div>
  );
}
