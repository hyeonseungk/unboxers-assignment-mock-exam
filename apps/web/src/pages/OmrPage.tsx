import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useExamStore } from "@/stores/useExamStore";
import { useExamTimer } from "@/hooks/useExamTimer";
import { useSubmitExamMutation } from "@/hooks/useSubmitExamMutation";
import { ExamHeader } from "@/components/exam/ExamHeader";
import { OmrCard } from "@/components/exam/OmrCard";
import { ExamKeypadPanel } from "@/components/exam/ExamKeypadPanel";
import { ExamTimerBar } from "@/components/exam/ExamTimerBar";
import { ExamWaitingOverlay } from "@/components/exam/ExamWaitingOverlay";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { HelpModal } from "@/components/modal/HelpModal";
import type {
  AnswerItem,
  ResultPageState,
} from "@/lib/types/exam";
import { SUBJECTIVE_DISPLAY_START } from "@/lib/constants/exam";

const EXAM_TIME_SECONDS = 60;
const MAX_SUBJECTIVE_DIGITS = 3;

interface PreparedResultState {
  previewSnapshot: NonNullable<ResultPageState["previewSnapshot"]>;
  submitPayload: NonNullable<ResultPageState["submitPayload"]>;
}

interface TimeoutResultState extends PreparedResultState {
  resultData?: NonNullable<ResultPageState["resultData"]>;
}

export function OmrPage() {
  const navigate = useNavigate();
  const submitMutation = useSubmitExamMutation();
  const hasSubmitted = useRef(false);
  const hasAttemptedAutoSubmit = useRef(false);

  const studentInfo = useExamStore((s) => s.studentInfo);
  const examStarted = useExamStore((s) => s.examStarted);
  const objectiveAnswers = useExamStore((s) => s.objectiveAnswers);
  const subjectiveAnswers = useExamStore((s) => s.subjectiveAnswers);
  const setObjectiveAnswer = useExamStore((s) => s.setObjectiveAnswer);
  const setSubjectiveAnswer = useExamStore((s) => s.setSubjectiveAnswer);
  const clearSubjectiveAnswer = useExamStore((s) => s.clearSubjectiveAnswer);
  const startExam = useExamStore((s) => s.startExam);

  const { formattedTime, percent, isWarning, isExpired } =
    useExamTimer(EXAM_TIME_SECONDS);

  const [selectedSubjective, setSelectedSubjective] = useState<number | null>(
    null,
  );
  const [keypadValue, setKeypadValue] = useState("");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isTimeoutSubmitting, setIsTimeoutSubmitting] = useState(false);
  const [showTimeoutResultModal, setShowTimeoutResultModal] = useState(false);
  const [timeoutErrorMessage, setTimeoutErrorMessage] = useState<string | null>(null);
  const [timeoutResultState, setTimeoutResultState] =
    useState<TimeoutResultState | null>(null);

  // 학생 정보 없으면 튜토리얼로 리다이렉트
  useEffect(() => {
    if (!studentInfo) {
      navigate("/", { replace: true });
    }
  }, [studentInfo, navigate]);

  // 답안 배열 빌드
  const getSubmittedSubjectiveAnswers = useCallback(() => {
    const nextSubjectiveAnswers = { ...subjectiveAnswers };

    if (selectedSubjective !== null) {
      if (keypadValue === "") {
        delete nextSubjectiveAnswers[selectedSubjective];
      } else {
        nextSubjectiveAnswers[selectedSubjective] = keypadValue;
      }
    }

    return nextSubjectiveAnswers;
  }, [keypadValue, selectedSubjective, subjectiveAnswers]);

  const buildAnswers = useCallback(
    (nextSubjectiveAnswers: Record<number, string>): AnswerItem[] => {
      const answers: AnswerItem[] = [];

      for (const [num, choice] of Object.entries(objectiveAnswers)) {
        answers.push({
          answerType: "objective",
          number: Number(num),
          answer: choice,
        });
      }

      for (const [num, value] of Object.entries(nextSubjectiveAnswers)) {
        if (value !== "") {
          answers.push({
            answerType: "subjective",
            number: Number(num) - (SUBJECTIVE_DISPLAY_START - 1),
            answer: Number(value),
          });
        }
      }

      return answers;
    },
    [objectiveAnswers],
  );

  const prepareSubmissionState = useCallback((): PreparedResultState | null => {
    if (!studentInfo) return null;
    const nextSubjectiveAnswers = getSubmittedSubjectiveAnswers();
    const draftAnswer =
      selectedSubjective !== null
        ? nextSubjectiveAnswers[selectedSubjective]
        : undefined;

    if (selectedSubjective !== null) {
      if (draftAnswer === undefined) {
        clearSubjectiveAnswer(selectedSubjective);
      } else {
        setSubjectiveAnswer(selectedSubjective, draftAnswer);
      }
    }

    const answers = buildAnswers(nextSubjectiveAnswers);
    return {
      submitPayload: {
        name: studentInfo.name,
        school: studentInfo.school,
        grade: studentInfo.grade,
        studentNumber: studentInfo.studentNumber,
        seatNumber: studentInfo.seatNumber,
        answers,
      },
      previewSnapshot: {
        studentInfo,
        objectiveAnswers,
        subjectiveAnswers: nextSubjectiveAnswers,
      },
    };
  }, [
    studentInfo,
    getSubmittedSubjectiveAnswers,
    selectedSubjective,
    clearSubjectiveAnswer,
    setSubjectiveAnswer,
    buildAnswers,
    objectiveAnswers,
  ]);

  const handleSubmit = useCallback(() => {
    if (hasSubmitted.current) return;
    const preparedResultState = prepareSubmissionState();
    if (!preparedResultState) return;
    hasSubmitted.current = true;

    navigate("/result", {
      state: {
        submitMode: "manual",
        ...preparedResultState,
      } satisfies ResultPageState,
    });
  }, [navigate, prepareSubmissionState]);

  const submitTimedOutExam = useCallback(
    (preparedResultState?: PreparedResultState | null) => {
      const nextPreparedResultState =
        preparedResultState ??
        (timeoutResultState
          ? {
              previewSnapshot: timeoutResultState.previewSnapshot,
              submitPayload: timeoutResultState.submitPayload,
            }
          : prepareSubmissionState());

      if (!nextPreparedResultState) return;

      setTimeoutResultState(nextPreparedResultState);
      setIsTimeoutSubmitting(true);
      setShowEndConfirm(false);
      setShowHelp(false);
      setShowTimeoutResultModal(false);
      setTimeoutErrorMessage(null);

      submitMutation.mutate(nextPreparedResultState.submitPayload, {
        onSuccess: (data) => {
          setIsTimeoutSubmitting(false);
          setTimeoutResultState({
            ...nextPreparedResultState,
            resultData: data,
          });
          setShowTimeoutResultModal(true);
        },
        onError: (error) => {
          setIsTimeoutSubmitting(false);
          setTimeoutErrorMessage(
            error.message || "자동 제출에 실패했습니다. 다시 시도해주세요.",
          );
          setShowTimeoutResultModal(true);
        },
      });
    },
    [prepareSubmissionState, submitMutation, timeoutResultState],
  );

  // 타이머 만료 시 자동 제출
  useEffect(() => {
    if (!isExpired || hasAttemptedAutoSubmit.current) return;
    hasAttemptedAutoSubmit.current = true;
    const preparedResultState = prepareSubmissionState();
    if (!preparedResultState) return;

    hasSubmitted.current = true;
    const timeoutId = window.setTimeout(() => {
      submitTimedOutExam(preparedResultState);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isExpired, prepareSubmissionState, submitTimedOutExam]);

  // 주관식 문항 선택
  const handleSubjectiveSelect = useCallback(
    (displayNumber: number) => {
      if (selectedSubjective === displayNumber) {
        setSelectedSubjective(null);
        setKeypadValue("");
      } else {
        setSelectedSubjective(displayNumber);
        setKeypadValue(subjectiveAnswers[displayNumber] ?? "");
      }
    },
    [selectedSubjective, subjectiveAnswers],
  );

  // 키패드 입력
  const handleKeyPress = useCallback(
    (key: string) => {
      setKeypadValue((prev) => {
        if (prev.length >= MAX_SUBJECTIVE_DIGITS) return prev;
        return prev + key;
      });
    },
    [],
  );

  const handleBackspace = useCallback(() => {
    setKeypadValue((prev) => prev.slice(0, -1));
  }, []);

  // 키패드 완료
  const handleComplete = useCallback(() => {
    if (selectedSubjective !== null && keypadValue) {
      setSubjectiveAnswer(selectedSubjective, keypadValue);
      setSelectedSubjective(null);
      setKeypadValue("");
    }
  }, [selectedSubjective, keypadValue, setSubjectiveAnswer]);

  const timeLimitLabel =
    EXAM_TIME_SECONDS >= 60
      ? `${Math.floor(EXAM_TIME_SECONDS / 60)}분`
      : `${EXAM_TIME_SECONDS}초`;
  const examInteractionDisabled = !examStarted || isTimeoutSubmitting;

  const handleTimeoutResultConfirm = useCallback(() => {
    if (!timeoutResultState?.resultData) return;

    setShowTimeoutResultModal(false);
    navigate("/result", {
      state: {
        submitMode: "manual",
        previewSnapshot: timeoutResultState.previewSnapshot,
        submitPayload: timeoutResultState.submitPayload,
        resultData: timeoutResultState.resultData,
      } satisfies ResultPageState,
    });
  }, [navigate, timeoutResultState]);

  const handleTimeoutRetry = useCallback(() => {
    submitTimedOutExam(timeoutResultState);
  }, [submitTimedOutExam, timeoutResultState]);

  if (!studentInfo) return null;

  return (
    <div className="h-full flex flex-col">
      <ExamHeader
        onEndExam={() => {
          if (isTimeoutSubmitting) return;
          setShowEndConfirm(true);
        }}
      />

      {/* 메인 영역 */}
      <div className="flex-1 overflow-hidden flex gap-4 px-6 pb-2">
        {/* OMR 카드 */}
        <div className="flex-1 relative min-w-0">
          <OmrCard
            studentInfo={studentInfo}
            objectiveAnswers={objectiveAnswers}
            subjectiveAnswers={subjectiveAnswers}
            selectedSubjective={selectedSubjective}
            onObjectiveSelect={setObjectiveAnswer}
            onSubjectiveSelect={handleSubjectiveSelect}
            disabled={examInteractionDisabled}
          />
          {!examStarted && <ExamWaitingOverlay onStart={startExam} />}
        </div>

        {/* 키패드 패널 */}
        <ExamKeypadPanel
          selectedQuestion={selectedSubjective}
          inputValue={keypadValue}
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onComplete={handleComplete}
          disabled={examInteractionDisabled}
        />
      </div>

      {/* 타이머 바 */}
      <ExamTimerBar
        formattedTime={formattedTime}
        percent={percent}
        isWarning={isWarning}
        examStarted={examStarted}
        timeLimitLabel={timeLimitLabel}
        onHelpClick={() => {
          if (isTimeoutSubmitting) return;
          setShowHelp(true);
        }}
      />

      {/* 종료 확인 모달 */}
      <ConfirmDialog
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        onConfirm={handleSubmit}
        title="시험을 종료하고 답안을 제출할까요?"
        message="종료하면 더 이상 답안을 수정할 수 없습니다."
        confirmText="제출하기"
        cancelText="계속 풀기"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showTimeoutResultModal}
        onClose={() => {}}
        onConfirm={
          timeoutErrorMessage ? handleTimeoutRetry : handleTimeoutResultConfirm
        }
        title={
          timeoutErrorMessage
            ? "자동 제출에 실패했어요"
            : "시험 시간이 종료되었어요"
        }
        message={
          timeoutErrorMessage
            ? "네트워크 문제로 자동 제출을 완료하지 못했습니다. 다시 시도해주세요."
            : "답안이 자동 제출되었습니다. 시험 결과를 확인해보세요."
        }
        confirmText={timeoutErrorMessage ? "다시 시도" : "시험 결과 확인"}
        variant={timeoutErrorMessage ? "warning" : "info"}
        errorMessage={timeoutErrorMessage ?? undefined}
        hideCancel
      />

      {/* 도움말 모달 */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
