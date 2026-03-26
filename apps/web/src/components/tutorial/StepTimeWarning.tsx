export function StepTimeWarning() {
  return (
    <div className="flex h-full items-center justify-center px-6 pb-4 md:px-8">
      <div className="flex w-full max-w-[856px] -translate-y-4 flex-col items-center gap-8 md:gap-10">
        <div className="w-full rounded-[18px] border border-[#f1ece5] bg-white px-6 py-5 shadow-[0_12px_28px_rgba(32,28,24,0.09),0_2px_6px_rgba(32,28,24,0.05)] md:px-10 md:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="shrink-0">
                  <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#5a5a5a] md:text-[15px]">
                    시험 종료까지 남은 시간
                  </p>
                  <p className="mt-1 text-[41.6px] font-bold leading-none tracking-[-0.05em] text-[#ff4f46] md:text-[44.8px]">
                    5초
                  </p>
                </div>

                <p className="shrink-0 pb-[3.5px] text-[15px] font-semibold tracking-[-0.02em] text-[#717171] sm:text-right md:text-[16px]">
                  시험 시간 60분
                </p>
              </div>

              <div
                aria-hidden="true"
                className="mt-[3px] h-[7px] w-full rounded-full bg-[#e7ebf3]"
              >
                <div
                  className="h-full rounded-full bg-[#ff4f46]"
                  style={{ width: "4%" }}
                />
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 md:shrink-0 md:flex-row md:items-center md:gap-4">
              <div
                aria-hidden="true"
                className="inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-[14px] border border-[#efe7da] bg-white px-5 text-[14px] font-semibold tracking-[-0.02em] text-[#191919] shadow-[0_12px_24px_rgba(18,18,18,0.08),0_2px_6px_rgba(18,18,18,0.05)]"
              >
                <span className="inline-flex size-4 items-center justify-center rounded-[5px] bg-[#181818] text-[11px] font-black leading-none text-white">
                  !
                </span>
                문제가 생겼나요?
              </div>
              <div
                aria-hidden="true"
                className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-[14px] px-6 text-[14px] font-bold tracking-[-0.02em] text-white shadow-[0_12px_24px_rgba(84,120,231,0.24),0_3px_8px_rgba(84,120,231,0.14)] md:min-w-[144px]"
                style={{
                  backgroundImage:
                    "radial-gradient(120% 140% at 0% 100%, rgba(12, 14, 20, 0.22) 0%, rgba(12, 14, 20, 0) 46%), linear-gradient(90deg, #5578e5 0%, #5e82ee 46%, #6b90f8 100%)",
                }}
              >
                답안 제출하기
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 text-center">
          <p className="text-[22px] font-bold leading-[1.35] tracking-[-0.05em] text-[#171717] md:whitespace-nowrap md:text-[27px]">
            시간이 모두 지나면 시험은 종료되고 OMR카드는 자동으로 제출돼요
          </p>
          <p className="mt-2 text-[22px] font-bold leading-[1.35] tracking-[-0.05em] text-[#ff4f46] md:text-[27px]">
            마킹하지 못한 답안은 모두 오답 처리되니 미리 마킹하세요
          </p>
        </div>
      </div>
    </div>
  );
}
