import { useState, useEffect, useCallback, useRef } from "react";
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
const SCAN_DURATION_MS = 3_000;

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
  const hasRequestedGrading = useRef(false);
  const resetExam = useExamStore((s) => s.resetExam);
  const restartExam = useExamStore((s) => s.restartExam);
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
  const [scanAttempt, setScanAttempt] = useState(0);

  useEffect(() => {
    if (!resultData && !submitPayload) {
      navigate("/", { replace: true });
    }
  }, [resultData, submitPayload, navigate]);

  useEffect(() => {
    if (phase !== "scanning" || !resultData) return;
    const timer = setTimeout(() => setPhase("result"), SCAN_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase, resultData]);

  useEffect(() => {
    if (
      phase !== "scanning" ||
      resultData ||
      !submitPayload ||
      hasRequestedGrading.current
    ) {
      return;
    }

    hasRequestedGrading.current = true;
    submitMutation.mutate(submitPayload, {
      onSuccess: (data) => {
        setResultData(data);
      },
      onError: (error) => {
        hasRequestedGrading.current = false;
        setScanError(error.message || "채점 요청에 실패했습니다. 다시 시도해주세요.");
      },
    });
  }, [phase, resultData, submitPayload, submitMutation, scanAttempt]);

  const handleShowResult = useCallback(() => {
    hasRequestedGrading.current = false;
    setScanError(null);
    setPhase("scanning");
    setScanAttempt((prev) => prev + 1);
  }, []);

  const handleRetryScan = useCallback(() => {
    hasRequestedGrading.current = false;
    setScanError(null);
    setScanAttempt((prev) => prev + 1);
  }, []);

  const handleRetry = useCallback(() => {
    restartExam(previewSnapshot?.studentInfo ?? studentInfo);
    navigate("/exam");
  }, [navigate, previewSnapshot?.studentInfo, restartExam, studentInfo]);

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
        <div className="relative h-full overflow-hidden bg-[#f6f4f1]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-[#fff0cc]/75 blur-3xl" />
            <div className="absolute right-[-80px] top-[64px] h-[280px] w-[280px] rounded-full bg-[#e9f2ff]/80 blur-3xl" />
            <div className="absolute bottom-[-120px] left-[32%] h-[260px] w-[260px] rounded-full bg-[#f5ecff]/40 blur-3xl" />
          </div>

          <div className="relative flex h-full flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
                <div className="px-1">
                  <h1 className="text-[32px] font-black leading-[1.12] tracking-[-0.06em] text-[#111111] sm:text-[38px]">
                    채점 결과를 확인해보세요
                  </h1>
                  <p className="mt-3 max-w-[720px] text-[15px] leading-relaxed text-[#6c675e] sm:text-[16px]">
                    맞은 문제와 오답을 빠르게 확인해보세요.
                  </p>
                </div>

                <ResultScoreCard
                  title={resultData.title}
                  score={resultData.score}
                  correctCount={resultData.correctCount}
                  wrongCount={resultData.wrongCount}
                  unansweredCount={resultData.unansweredCount}
                  studentInfo={previewSnapshot?.studentInfo}
                />
                <ResultItemGrid results={resultData.results} />
              </div>
            </div>
            <ResultActions onRetry={handleRetry} onGoHome={handleGoHome} />
          </div>
        </div>
      )}
    </div>
  );
}
