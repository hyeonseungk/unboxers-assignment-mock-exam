import { Button } from "@/components/ui";

interface ResultActionsProps {
  onRetry: () => void;
  onGoHome: () => void;
}

export function ResultActions({ onRetry, onGoHome }: ResultActionsProps) {
  return (
    <div className="flex items-center justify-center gap-4 px-6 py-6 border-t border-line">
      <Button variant="secondary" size="lg" onClick={onRetry}>
        다시 풀기
      </Button>
      <Button variant="dark" size="lg" onClick={onGoHome}>
        홈으로
      </Button>
    </div>
  );
}
