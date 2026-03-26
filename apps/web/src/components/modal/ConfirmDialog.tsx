import { BaseModal } from "./BaseModal";
import { Button } from "@/components/ui";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
  errorMessage?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  variant = "info",
  confirmDisabled = false,
  cancelDisabled = false,
  errorMessage,
}: ConfirmDialogProps) {
  const titleId = "confirm-dialog-title";
  const descId = "confirm-dialog-desc";

  const confirmVariant =
    variant === "danger" ? "danger" : variant === "warning" ? "primary" : "dark";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
    >
      <div className="bg-surface rounded-2xl shadow-2xl p-8 w-[min(480px,90vw)] border border-line">
        <h2 id={titleId} className="text-xl font-bold text-fg-primary">
          {title}
        </h2>
        <p id={descId} className="mt-3 text-base text-fg-secondary leading-relaxed">
          {message}
        </p>
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
            {errorMessage}
          </div>
        )}
        <div className="flex gap-4 mt-8">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={onClose}
            disabled={cancelDisabled}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            size="lg"
            className="flex-1"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
