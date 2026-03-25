import { Button } from "@/components/ui";
import type { ButtonVariant } from "@/components/ui";
import { ChevronLeft } from "lucide-react";

interface TutorialFooterProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export function TutorialFooter({
  currentStep,
  totalSteps,
  canGoNext,
  onPrev,
  onNext,
  onSkip,
}: TutorialFooterProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const isInteractiveStep = currentStep === 2 || currentStep === 3;

  const nextDisabled = isInteractiveStep && !canGoNext;
  const nextVariant: ButtonVariant =
    isInteractiveStep && canGoNext ? "primary" : "dark";

  return (
    <footer className="shrink-0 relative flex items-center justify-center px-8 py-5 min-h-[88px]">
      {/* Left: Previous */}
      {!isFirstStep && (
        <div className="absolute left-8">
          <Button variant="ghost" onClick={onPrev}>
            <ChevronLeft className="size-5" />
            이전으로
          </Button>
        </div>
      )}

      {/* Center: Skip & Next / Finish */}
      <div className="flex gap-3 justify-center w-full max-w-[400px]">
        {!isLastStep && (
          <Button variant="secondary" onClick={onSkip} size="lg" className="flex-1">
            튜토리얼 건너뛰기
          </Button>
        )}

        {isLastStep ? (
          <Button variant="dark" onClick={onNext} size="lg" className="flex-1">
            시험 화면으로 이동
          </Button>
        ) : (
          <Button
            variant={nextVariant}
            onClick={onNext}
            disabled={nextDisabled}
            size="lg"
            className="flex-1"
          >
            다음
          </Button>
        )}
      </div>
    </footer>
  );
}
