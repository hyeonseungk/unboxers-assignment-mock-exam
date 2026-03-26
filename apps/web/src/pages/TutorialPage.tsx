import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils/cn";
import { TutorialHeader } from "@/components/tutorial/TutorialHeader";
import { TutorialFooter } from "@/components/tutorial/TutorialFooter";
import { StepIntro } from "@/components/tutorial/StepIntro";
import { StepOmrConcept } from "@/components/tutorial/StepOmrConcept";
import { StepObjectivePractice } from "@/components/tutorial/StepObjectivePractice";
import { StepSubjectivePractice } from "@/components/tutorial/StepSubjectivePractice";
import { StepTimeWarning } from "@/components/tutorial/StepTimeWarning";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { useExamStore } from "@/stores/useExamStore";
import type { StudentInfo } from "@/lib/types/exam";

const TOTAL_STEPS = 5;
const SKIP_STUDENT_INFO: StudentInfo = {
  name: "신희철",
  school: "서울초등학교",
  grade: 2,
  studentNumber: 12,
  seatNumber: 24,
};

function isInteractive(step: number) {
  return step === 2 || step === 3;
}

export function TutorialPage() {
  const navigate = useNavigate();
  const setStudentInfo = useExamStore((s) => s.setStudentInfo);
  const resetExam = useExamStore((s) => s.resetExam);
  const startExam = useExamStore((s) => s.startExam);

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [canGoNext, setCanGoNext] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);

  const handleQuickStart = useCallback(
    (info: StudentInfo) => {
      resetExam();
      setStudentInfo(info);
      startExam();
      navigate("/exam");
    },
    [navigate, resetExam, setStudentInfo, startExam],
  );

  const goNext = useCallback(() => {
    if (currentStep >= TOTAL_STEPS - 1) {
      setShowStartConfirm(true);
      return;
    }
    setHasNavigated(true);
    setDirection("next");
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setCanGoNext(!isInteractive(nextStep));
  }, [currentStep]);

  const goPrev = useCallback(() => {
    if (currentStep <= 0) return;
    setHasNavigated(true);
    setDirection("prev");
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    setCanGoNext(!isInteractive(prevStep));
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    setShowStartConfirm(true);
  }, []);

  const handleStartConfirm = useCallback(() => {
    setShowStartConfirm(false);
    handleQuickStart(SKIP_STUDENT_INFO);
  }, [handleQuickStart]);

  const handleGoHome = useCallback(() => {
    setHasNavigated(false);
    setCurrentStep(0);
    setDirection("next");
    setCanGoNext(true);
  }, []);

  const handleStepComplete = useCallback((complete: boolean) => {
    setCanGoNext(complete);
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepIntro />;
      case 1:
        return <StepOmrConcept />;
      case 2:
        return <StepObjectivePractice onStateChange={handleStepComplete} />;
      case 3:
        return <StepSubjectivePractice onStateChange={handleStepComplete} />;
      case 4:
        return <StepTimeWarning />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#f6f4f1]">
      <TutorialHeader onHome={handleGoHome} />

      <div className="flex-1 overflow-hidden">
        <div
          key={currentStep}
          className={cn(
            "h-full",
            hasNavigated &&
              (direction === "next"
                ? "animate-slide-in-right"
                : "animate-slide-in-left"),
          )}
        >
          {renderStep()}
        </div>
      </div>

      <TutorialFooter
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        canGoNext={canGoNext}
        onPrev={goPrev}
        onNext={goNext}
        onSkip={handleSkip}
      />

      <ConfirmDialog
        isOpen={showStartConfirm}
        onClose={() => setShowStartConfirm(false)}
        onConfirm={handleStartConfirm}
        title="시험을 시작할까요?"
        message="확인을 누르면 시험 화면으로 이동하면서 타이머가 바로 시작됩니다. 시험 시간이 끝나면 답안은 자동으로 제출됩니다."
        confirmText="시험 시작"
        cancelText="취소"
        variant="warning"
      />
    </div>
  );
}
