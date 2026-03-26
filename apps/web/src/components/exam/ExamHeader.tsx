interface ExamHeaderProps {
  onEndExam: () => void;
}

export function ExamHeader({ onEndExam }: ExamHeaderProps) {
  return (
    <header className="flex items-center justify-end px-6 py-3 shrink-0">
      <button
        type="button"
        onClick={onEndExam}
        className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border border-[#f1eee7]
                   bg-white px-[13px] text-[14px] font-semibold tracking-[-0.02em] text-[#171717]
                   shadow-[0_10px_24px_rgba(18,18,18,0.08),0_2px_6px_rgba(18,18,18,0.05)]
                   select-none touch-manipulation transition-[transform,background-color,box-shadow] duration-150
                   active:scale-[0.98] active:bg-[#faf7f1]
                   active:shadow-[0_8px_20px_rgba(18,18,18,0.06),0_2px_6px_rgba(18,18,18,0.04)]"
      >
        <EndExamIcon />
        종료하기
      </button>
    </header>
  );
}

function EndExamIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="size-[16px] shrink-0 text-[#111111]"
      fill="currentColor"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.887 1.667c-.991 0-1.795.804-1.795 1.795v1.282h1.538V3.462a.256.256 0 0 1 .257-.257h6.409c.142 0 .256.115.256.257v13.077a.257.257 0 0 1-.256.257H9.887a.257.257 0 0 1-.257-.257v-1.283H8.092v1.283c0 .99.804 1.794 1.795 1.794h6.409c.99 0 1.794-.803 1.794-1.794V3.462c0-.991-.804-1.795-1.794-1.795H9.887Z" />
      <path d="M3.128 10c0-.425.344-.77.769-.77h8.074L10.24 7.5l1.088-1.088 3.59 3.59-3.59 3.588-1.087-1.088 1.73-1.733H3.897A.77.77 0 0 1 3.128 10Z" />
    </svg>
  );
}
