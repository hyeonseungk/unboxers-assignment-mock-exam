export function StepIntro() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-10 px-8">
      {/* Exam paper illustration */}
      <div className="relative z-0 mt-6 mb-2">
        {/* Background layers */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-surface border border-[#E5E7EB] rounded-xl w-full h-full -z-10"
            style={{
              top: `-${(4 - i) * 6}px`,
              right: `-${(4 - i) * 6}px`,
            }}
          />
        ))}
        {/* Front layer */}
        <div className="w-52 bg-surface border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
          <div className="text-center space-y-1">
            <p className="text-base text-fg-secondary">실전 모의고사</p>
            <p className="text-2xl font-bold text-fg-primary">공통수학2</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-10 bg-background-secondary rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-2xl font-bold text-fg-primary text-center leading-relaxed max-w-2xl">
        모의고사 모드는 처음이시죠? 실전 모의고사는
        <br />
        실전과 최대한 비슷한 환경으로 진행돼요
      </p>
    </div>
  );
}
