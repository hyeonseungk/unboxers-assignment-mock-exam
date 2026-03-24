import { Button } from "@/components/ui";

interface ExamWaitingOverlayProps {
  onStart: () => void;
}

export function ExamWaitingOverlay({ onStart }: ExamWaitingOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-overlay/30 backdrop-blur-[2px] rounded-2xl">
      <div className="bg-surface rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4 border border-line max-w-sm">
        <p className="text-xl font-bold text-fg-primary">시험 준비 완료</p>
        <p className="text-base text-fg-secondary text-center leading-relaxed">
          시작 버튼을 누르면 시험이 시작됩니다.
          <br />
          시험 시간이 끝나면 자동으로 제출됩니다.
        </p>
        <Button variant="dark" size="lg" className="w-full mt-2" onClick={onStart}>
          시험 시작
        </Button>
      </div>
    </div>
  );
}
