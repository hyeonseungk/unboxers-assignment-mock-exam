import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils/cn";
import { TutorialHeader } from "@/components/tutorial/TutorialHeader";
import { TutorialFooter } from "@/components/tutorial/TutorialFooter";
import { StepIntro } from "@/components/tutorial/StepIntro";
import { StepOmrConcept } from "@/components/tutorial/StepOmrConcept";
import { StepObjectivePractice } from "@/components/tutorial/StepObjectivePractice";
import { StepSubjectivePractice } from "@/components/tutorial/StepSubjectivePractice";
import { StepTimeWarning } from "@/components/tutorial/StepTimeWarning";

const TOTAL_STEPS = 5;

function isInteractive(step: number) {
  return step === 2 || step === 3;
}

export function TutorialPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [canGoNext, setCanGoNext] = useState(true);
  const hasNavigated = useRef(false);

  const goNext = useCallback(() => {
    if (currentStep >= TOTAL_STEPS - 1) {
      // TODO: Show student info modal before navigating
      navigate("/exam");
      return;
    }
    hasNavigated.current = true;
    setDirection("next");
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setCanGoNext(!isInteractive(nextStep));
  }, [currentStep, navigate]);

  const goPrev = useCallback(() => {
    if (currentStep <= 0) return;
    hasNavigated.current = true;
    setDirection("prev");
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    setCanGoNext(!isInteractive(prevStep));
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    // TODO: Show student info modal before navigating
    navigate("/exam");
  }, [navigate]);

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
    <div className="h-full flex flex-col">
      <TutorialHeader />

      <div className="flex-1 overflow-hidden">
        <div
          key={currentStep}
          className={cn(
            "h-full",
            hasNavigated.current &&
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
    </div>
  );
}
