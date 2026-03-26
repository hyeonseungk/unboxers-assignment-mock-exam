import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useExamStore } from "@/stores/useExamStore";
import { useExamTimer } from "@/hooks/useExamTimer";
import { ExamHeader } from "@/components/exam/ExamHeader";
import { OmrCard } from "@/components/exam/OmrCard";
import { ExamKeypadPanel } from "@/components/exam/ExamKeypadPanel";
import { ExamTimerBar } from "@/components/exam/ExamTimerBar";
import { ExamWaitingOverlay } from "@/components/exam/ExamWaitingOverlay";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { HelpModal } from "@/components/modal/HelpModal";
import type {
  AnswerItem,
  ExamSubmitMode,
  ResultPageState,
} from "@/lib/types/exam";
import { SUBJECTIVE_DISPLAY_START } from "@/lib/constants/exam";

const EXAM_TIME_SECONDS = 60;
const MAX_SUBJECTIVE_DIGITS = 3;

export function OmrPage() {
  const navigate = useNavigate();
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

  // 제출 처리
  const handleSubmit = useCallback((submitMode: ExamSubmitMode = "manual") => {
    if (!studentInfo || hasSubmitted.current) return;
    hasSubmitted.current = true;

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
    const resultState: ResultPageState = {
      submitMode,
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

    navigate("/result", { state: resultState });
  }, [
    studentInfo,
    getSubmittedSubjectiveAnswers,
    selectedSubjective,
    clearSubjectiveAnswer,
    setSubjectiveAnswer,
    buildAnswers,
    objectiveAnswers,
    navigate,
  ]);

  // 타이머 만료 시 자동 제출
  useEffect(() => {
    if (!isExpired || hasAttemptedAutoSubmit.current) return;
    hasAttemptedAutoSubmit.current = true;
    const timeoutId = window.setTimeout(() => {
      handleSubmit("timeout");
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [isExpired, handleSubmit]);

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

  if (!studentInfo) return null;

  return (
    <div className="h-full flex flex-col">
      <ExamHeader onEndExam={() => setShowEndConfirm(true)} />

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
            disabled={!examStarted}
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
          disabled={!examStarted}
        />
      </div>

      {/* 타이머 바 */}
      <ExamTimerBar
        formattedTime={formattedTime}
        percent={percent}
        isWarning={isWarning}
        examStarted={examStarted}
        timeLimitLabel={timeLimitLabel}
        onHelpClick={() => setShowHelp(true)}
      />

      {/* 종료 확인 모달 */}
      <ConfirmDialog
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        onConfirm={() => handleSubmit("manual")}
        title="시험을 종료하고 답안을 제출할까요?"
        message="종료하면 더 이상 답안을 수정할 수 없습니다."
        confirmText="제출하기"
        cancelText="계속 풀기"
        variant="danger"
      />

      {/* 도움말 모달 */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
