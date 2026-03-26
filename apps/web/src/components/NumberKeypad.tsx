import { cn } from "@/lib/utils/cn";

interface NumberKeypadProps {
  value: string;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onComplete?: () => void;
  showCompleteButton?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const SPECIAL_KEYS = ["√", "/", "-"];
const NUMBER_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function NumberKeypad({
  value,
  onKeyPress,
  onBackspace,
  onComplete,
  showCompleteButton = false,
  disabled = false,
  placeholder = "답안 입력을 시작하세요",
}: NumberKeypadProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Input display */}
      <div className="h-14 flex items-center justify-center border border-line rounded-xl bg-surface px-4">
        {value ? (
          <span className="text-xl font-semibold text-fg-primary">{value}</span>
        ) : (
          <span className="text-base text-fg-muted">{placeholder}</span>
        )}
      </div>

      {/* Key grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Special keys (disabled) */}
        {SPECIAL_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            disabled
            className="h-14 rounded-xl bg-surface-secondary text-fg-muted text-xl font-medium opacity-40 select-none"
          >
            {key}
          </button>
        ))}

        {/* Number keys 1-9 */}
        {NUMBER_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKeyPress(key)}
            disabled={disabled}
            className={cn(
              "h-14 rounded-xl bg-surface text-fg-primary text-xl font-medium",
              "border border-line",
              "active:scale-95 active:bg-background-secondary",
              "transition-all duration-75",
              "select-none touch-manipulation",
              disabled && "opacity-40 pointer-events-none",
            )}
          >
            {key}
          </button>
        ))}

        {/* Bottom row: empty, 0, backspace */}
        <div />
        <button
          type="button"
          onClick={() => onKeyPress("0")}
          disabled={disabled}
          className={cn(
            "h-14 rounded-xl bg-surface text-fg-primary text-xl font-medium",
            "border border-line",
            "active:scale-95 active:bg-background-secondary",
            "transition-all duration-75",
            "select-none touch-manipulation",
            disabled && "opacity-40 pointer-events-none",
          )}
        >
          0
        </button>
        <button
          type="button"
          onClick={onBackspace}
          disabled={disabled}
          className={cn(
            "h-14 rounded-xl bg-surface text-fg-primary text-xl font-medium",
            "border border-line",
            "active:scale-95 active:bg-background-secondary",
            "transition-all duration-75",
            "select-none touch-manipulation",
            disabled && "opacity-40 pointer-events-none",
          )}
        >
          ⌫
        </button>
      </div>

      {/* Complete button */}
      {showCompleteButton && (
        <button
          type="button"
          onClick={onComplete}
          disabled={!value}
          className={cn(
            "h-14 rounded-xl text-xl font-semibold",
            "select-none touch-manipulation",
            "active:scale-[0.98] transition-all duration-75",
            value
              ? "bg-[linear-gradient(90deg,#6F90FF_0%,#5E86F3_46%,#4D6FC2_100%)] text-white shadow-[0_14px_28px_rgba(77,111,194,0.28)]"
              : "bg-surface-secondary text-fg-muted pointer-events-none",
          )}
        >
          완료
        </button>
      )}
    </div>
  );
}
