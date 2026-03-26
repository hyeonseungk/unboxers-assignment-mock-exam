import { Button } from "@/components/ui";
import { Home, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ResultActionsProps {
  onRetry: () => void;
  onGoHome: () => void;
}

export function ResultActions({ onRetry, onGoHome }: ResultActionsProps) {
  const buttonBaseClassName =
    "min-h-0 h-[52px] rounded-[16px] px-6 py-0 text-[15px] font-bold tracking-[-0.03em]";

  return (
    <div className="border-t border-[#e7e0d5] bg-white/86 px-6 py-5 backdrop-blur-[18px]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[18px] font-black tracking-[-0.04em] text-[#111111]">
            다음 동작을 선택하세요
          </p>
          <p className="mt-1 text-[14px] leading-relaxed text-[#706b63]">
            처음부터 다시 응시하거나 홈으로 돌아갈 수 있어요.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            size="md"
            onClick={onRetry}
            className={cn(
              buttonBaseClassName,
              "border-none bg-[#fffdfa] text-[#171717]",
              "shadow-[0_10px_24px_rgba(17,24,39,0.08),0_2px_6px_rgba(17,24,39,0.04)]",
            )}
          >
            <RotateCcw className="size-[17px]" />
            다시 풀기
          </Button>
          <Button
            variant="dark"
            size="md"
            onClick={onGoHome}
            className={cn(
              buttonBaseClassName,
              "border-none bg-[linear-gradient(90deg,#2c2c2c_0%,#424242_38%,#595959_100%)] text-white",
              "shadow-[0_12px_28px_rgba(17,24,39,0.16),0_3px_8px_rgba(17,24,39,0.08)]",
            )}
          >
            <Home className="size-[17px]" />
            홈으로
          </Button>
        </div>
      </div>
    </div>
  );
}
