export function StepOmrConcept() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-10 px-8">
      {/* Two illustrations side by side */}
      <div className="flex items-center gap-8">
        {/* Exam paper */}
        <div className="w-44 bg-surface border border-line rounded-xl p-5 shadow-sm">
          <div className="text-center space-y-1">
            <p className="text-base text-fg-secondary">실전 모의고사</p>
            <p className="text-xl font-bold text-fg-primary">공통수학2</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-8 bg-background-secondary rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* OMR card */}
        <div className="w-44 bg-surface border border-line rounded-xl p-5 shadow-sm">
          <p className="text-center text-base font-semibold text-fg-primary mb-3">
            OMR 카드
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-full bg-background-secondary mx-auto"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-2xl font-bold text-fg-primary text-center leading-relaxed max-w-2xl">
        실제 시험지 크기에 인쇄된 시험지에 문제를 풀고
        <br />
        화면에 표시된 OMR카드에 답을 마킹해요
      </p>
    </div>
  );
}
