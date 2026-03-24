import { NumberKeypad } from "@/components/NumberKeypad";

interface ExamKeypadPanelProps {
  selectedQuestion: number | null;
  inputValue: string;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onComplete: () => void;
  disabled?: boolean;
}

export function ExamKeypadPanel({
  selectedQuestion,
  inputValue,
  onKeyPress,
  onBackspace,
  onComplete,
  disabled = false,
}: ExamKeypadPanelProps) {
  const hasSelection = selectedQuestion !== null;

  return (
    <div className="flex flex-col gap-4 w-56 shrink-0">
      {/* 안내 텍스트 */}
      <div className="text-base text-fg-secondary leading-relaxed">
        {hasSelection ? (
          <p>
            <span className="font-bold text-fg-primary">{selectedQuestion}번</span>{" "}
            문항의 답안을 입력하세요.
          </p>
        ) : (
          <>
            <p>
              주관식 문항을 선택하면 키패드로 답안을 입력할 수 있습니다.
            </p>
            <p className="mt-2">
              객관식 문항은 OMR 카드에서 직접 버블을 터치하세요.
            </p>
          </>
        )}
      </div>

      {/* 키패드 */}
      <NumberKeypad
        value={inputValue}
        onKeyPress={onKeyPress}
        onBackspace={onBackspace}
        onComplete={onComplete}
        showCompleteButton={hasSelection && inputValue.length > 0}
        disabled={disabled || !hasSelection}
        placeholder={hasSelection ? "숫자를 입력하세요" : "문항을 선택하세요"}
      />
    </div>
  );
}
