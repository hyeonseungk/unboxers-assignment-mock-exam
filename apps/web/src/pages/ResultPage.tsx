import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useExamStore } from "@/stores/useExamStore";
import { useSubmitExamMutation } from "@/hooks/useSubmitExamMutation";
import type {
  ExamSubmitResponse,
  ResultPageState,
  ResultPreviewSnapshot,
} from "@/lib/types/exam";
import { SubmitCompleteView } from "@/components/result/SubmitCompleteView";
import { ScanAnimationView } from "@/components/result/ScanAnimationView";
import { ResultScoreCard } from "@/components/result/ResultScoreCard";
import { ResultItemGrid } from "@/components/result/ResultItemGrid";
import { ResultActions } from "@/components/result/ResultActions";

type ResultPhase = "complete" | "scanning" | "result";
const SCAN_DURATION_MS = 60 * 60 * 1000;

function isResultPageState(
  state: ExamSubmitResponse | ResultPageState | null,
): state is ResultPageState {
  return Boolean(
    state &&
      (
        "submitPayload" in state ||
        "previewSnapshot" in state ||
        "submitMode" in state ||
        "resultData" in state
      ),
  );
}

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const submitMutation = useSubmitExamMutation();
  const resetExam = useExamStore((s) => s.resetExam);
  const studentInfo = useExamStore((s) => s.studentInfo);
  const objectiveAnswers = useExamStore((s) => s.objectiveAnswers);
  const subjectiveAnswers = useExamStore((s) => s.subjectiveAnswers);
  const navigationState = location.state as ExamSubmitResponse | ResultPageState | null;
  const resultPageState = isResultPageState(navigationState)
    ? navigationState
    : null;
  const legacyResultData: ExamSubmitResponse | null = isResultPageState(
    navigationState,
  )
    ? null
    : navigationState;
  const initialResultData: ExamSubmitResponse | null =
    resultPageState?.resultData ?? legacyResultData;
  const submitMode = resultPageState?.submitMode ?? "manual";
  const submitPayload = resultPageState?.submitPayload ?? null;
  const previewSnapshot: ResultPreviewSnapshot | null =
    resultPageState?.previewSnapshot
      ? resultPageState.previewSnapshot
      : studentInfo
        ? {
            studentInfo,
            objectiveAnswers,
            subjectiveAnswers,
          }
        : null;

  const [resultData, setResultData] = useState<ExamSubmitResponse | null>(
    initialResultData,
  );
  const [phase, setPhase] = useState<ResultPhase>(
    submitMode === "timeout" ? "scanning" : "complete",
  );
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanElapsed, setScanElapsed] = useState(false);
  const [hasRequestedGrading, setHasRequestedGrading] = useState(false);

  useEffect(() => {
    if (!resultData && !submitPayload) {
      navigate("/", { replace: true });
    }
  }, [resultData, submitPayload, navigate]);

  useEffect(() => {
    if (phase !== "scanning") return;
    setScanElapsed(false);
    setHasRequestedGrading(false);
    const timer = setTimeout(() => setScanElapsed(true), SCAN_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "scanning" || resultData || !submitPayload || hasRequestedGrading) return;

    setScanError(null);
    setHasRequestedGrading(true);
    submitMutation.mutate(submitPayload, {
      onSuccess: (data) => {
        setResultData(data);
      },
      onError: (error) => {
        setScanError(error.message || "채점 요청에 실패했습니다. 다시 시도해주세요.");
      },
    });
  }, [phase, resultData, submitPayload, submitMutation, hasRequestedGrading]);

  useEffect(() => {
    if (phase !== "scanning" || !scanElapsed || !resultData) return;
    setPhase("result");
  }, [phase, resultData, scanElapsed]);

  const handleShowResult = useCallback(() => {
    setScanError(null);
    setPhase("scanning");
  }, []);

  const handleRetryScan = useCallback(() => {
    setScanError(null);
    setHasRequestedGrading(false);
  }, []);

  const handleRetry = useCallback(() => {
    resetExam();
    navigate("/");
  }, [resetExam, navigate]);

  const handleGoHome = useCallback(() => {
    resetExam();
    navigate("/");
  }, [resetExam, navigate]);

  if (!resultData && !submitPayload) return null;

  return (
    <div className="h-dvh w-dvw overflow-hidden bg-background">
      {phase === "complete" && (
        <SubmitCompleteView
          previewSnapshot={previewSnapshot}
          onShowResult={handleShowResult}
        />
      )}

      {phase === "scanning" && (
        <ScanAnimationView
          previewSnapshot={previewSnapshot}
          errorMessage={scanError}
          onRetry={submitPayload ? handleRetryScan : undefined}
        />
      )}

      {phase === "result" && resultData && (
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
