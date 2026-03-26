import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useExamStore } from "@/stores/useExamStore";
import { useExamTimer } from "@/hooks/useExamTimer";
import { useSubmitExamMutation } from "@/hooks/useSubmitExamMutation";
import { ExamHeader } from "@/components/exam/ExamHeader";
import {
  OMR_CARD_BASE_HEIGHT,
  OMR_CARD_BASE_WIDTH,
  OmrCard,
} from "@/components/exam/OmrCard";
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
const MAX_SUBJECTIVE_INPUT_LENGTH = 3;
const OMR_CARD_MAX_SCALE = 1.04;
const OMR_CARD_VIEWPORT_PADDING_X = 24;
const OMR_CARD_VIEWPORT_PADDING_Y = 24;
const SUBMITTABLE_SUBJECTIVE_ANSWER_PATTERN = /^-?\d+$/;

function parseSubjectiveAnswerForSubmission(value: string) {
  if (!SUBMITTABLE_SUBJECTIVE_ANSWER_PATTERN.test(value)) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) ? parsedValue : null;
}

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
  const omrViewportRef = useRef<HTMLDivElement>(null);

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
  const [omrCardScale, setOmrCardScale] = useState(1);

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
        if (value === "") continue;

        const parsedAnswer = parseSubjectiveAnswerForSubmission(value);

        if (parsedAnswer === null) continue;

        answers.push({
          answerType: "subjective",
          number: Number(num) - (SUBJECTIVE_DISPLAY_START - 1),
          answer: parsedAnswer,
        });
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
        if (prev.length >= MAX_SUBJECTIVE_INPUT_LENGTH) return prev;
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

  useLayoutEffect(() => {
    const viewport = omrViewportRef.current;

    if (!viewport) return;

    const updateScale = () => {
      const nextScale = Math.min(
        OMR_CARD_MAX_SCALE,
        (viewport.clientWidth - OMR_CARD_VIEWPORT_PADDING_X) / OMR_CARD_BASE_WIDTH,
        (viewport.clientHeight - OMR_CARD_VIEWPORT_PADDING_Y) / OMR_CARD_BASE_HEIGHT,
      );

      const safeScale = Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1;

      setOmrCardScale((prevScale) =>
        Math.abs(prevScale - safeScale) < 0.001 ? prevScale : safeScale,
      );
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (!studentInfo) return null;

  const scaledOmrCardWidth = OMR_CARD_BASE_WIDTH * omrCardScale;
  const scaledOmrCardHeight = OMR_CARD_BASE_HEIGHT * omrCardScale;

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
        <div ref={omrViewportRef} className="relative flex-1 min-h-0 min-w-0">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: `${scaledOmrCardWidth}px`,
              height: `${scaledOmrCardHeight}px`,
            }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: `${OMR_CARD_BASE_WIDTH}px`,
                height: `${OMR_CARD_BASE_HEIGHT}px`,
                transform: `scale(${omrCardScale})`,
              }}
            >
              <OmrCard
                studentInfo={studentInfo}
                objectiveAnswers={objectiveAnswers}
                subjectiveAnswers={subjectiveAnswers}
                selectedSubjective={selectedSubjective}
                onObjectiveSelect={setObjectiveAnswer}
                onSubjectiveSelect={handleSubjectiveSelect}
                disabled={examInteractionDisabled}
              />
            </div>

            {!examStarted && <ExamWaitingOverlay onStart={startExam} />}
          </div>
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
