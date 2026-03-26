import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
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
  const buttonSizeClassName =
    "min-h-0 h-[52px] w-full rounded-[14px] px-0 py-0 sm:w-[174px]";
  const buttonTextClassName = "text-[15px] font-bold tracking-[-0.03em]";
  const paperButtonClassName = cn(
    buttonSizeClassName,
    buttonTextClassName,
    "border-none bg-[#fffdfa] text-[#171717]",
    "shadow-[0_10px_24px_rgba(17,24,39,0.08),0_2px_6px_rgba(17,24,39,0.04)]",
  );
  const darkButtonClassName = cn(
    buttonSizeClassName,
    buttonTextClassName,
    "border-none bg-[linear-gradient(90deg,#2c2c2c_0%,#424242_38%,#595959_100%)] text-white",
    "shadow-[0_12px_28px_rgba(17,24,39,0.16),0_3px_8px_rgba(17,24,39,0.08)]",
    "disabled:border disabled:border-[#efeee8] disabled:bg-none disabled:bg-[#f1efe7] disabled:text-[#c5c0b4]",
    "disabled:shadow-[0_10px_24px_rgba(17,24,39,0.04),0_2px_6px_rgba(17,24,39,0.02)]",
  );

  const renderNextButton = (label: string) => (
    <Button
      variant="dark"
      onClick={onNext}
      disabled={nextDisabled}
      size="md"
      className={darkButtonClassName}
    >
      {label}
    </Button>
  );

  return (
    <footer className="shrink-0 px-6 pb-7 pt-2 md:px-8 md:pb-9">
      <div className="mx-auto max-w-[1110px]">
        {isFirstStep ? (
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {!isLastStep && (
              <Button
                variant="secondary"
                onClick={onSkip}
                size="md"
                className={paperButtonClassName}
              >
                튜토리얼 건너뛰기
              </Button>
            )}
            {isLastStep ? renderNextButton("시험 화면으로 이동") : renderNextButton("다음")}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="secondary"
              onClick={onPrev}
              size="md"
              className={cn("gap-[2px]", paperButtonClassName)}
            >
              <ChevronLeft className="size-[18px]" />
              이전으로
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {!isLastStep && (
                <Button
                  variant="secondary"
                  onClick={onSkip}
                  size="md"
                  className={paperButtonClassName}
                >
                  튜토리얼 건너뛰기
                </Button>
              )}

              {isLastStep ? renderNextButton("시험 화면으로 이동") : renderNextButton("다음")}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
