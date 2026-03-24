import { BaseModal } from "./BaseModal";
import { Button } from "@/components/ui";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="help-modal-title"
    >
      <div className="bg-surface rounded-2xl shadow-2xl p-8 w-[min(520px,92vw)] border border-line">
        <h2
          id="help-modal-title"
          className="text-xl font-bold text-fg-primary"
        >
          도움말
        </h2>

        <div className="mt-4 flex flex-col gap-4 text-base text-fg-secondary leading-relaxed">
          <div>
            <p className="font-semibold text-fg-primary">
              객관식 답안은 어떻게 마킹하나요?
            </p>
            <p>
              OMR 카드의 해당 문항 번호에서 원하는 번호의 버블을 터치하세요.
              다시 터치하면 선택이 해제됩니다.
            </p>
          </div>
          <div>
            <p className="font-semibold text-fg-primary">
              주관식 답안은 어떻게 입력하나요?
            </p>
            <p>
              주관식 문항을 터치하면 우측 키패드가 활성화됩니다. 숫자를 입력한 후
              완료 버튼을 눌러주세요.
            </p>
          </div>
          <div>
            <p className="font-semibold text-fg-primary">
              시간이 다 되면 어떻게 되나요?
            </p>
            <p>
              시험 시간이 종료되면 자동으로 답안이 제출됩니다. 남은 시간 30초
              이하일 때 경고가 표시됩니다.
            </p>
          </div>
          <div>
            <p className="font-semibold text-fg-primary">
              시험을 중도 종료하고 싶어요.
            </p>
            <p>
              우측 상단의 &lsquo;종료하기&rsquo; 버튼을 눌러 답안을 제출할 수
              있습니다.
            </p>
          </div>
        </div>

        <Button
          variant="dark"
          size="lg"
          className="w-full mt-8"
          onClick={onClose}
        >
          닫기
        </Button>
      </div>
    </BaseModal>
  );
}
