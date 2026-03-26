import { TutorialExamPaperIllustration } from "./TutorialExamPaperIllustration";

export function StepIntro() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-10 px-8">
      <TutorialExamPaperIllustration variant="intro" className="mt-6 mb-2" />

      {/* Description */}
      <p className="text-2xl font-bold text-fg-primary text-center leading-relaxed max-w-2xl">
        모의고사 모드는 처음이시죠? 실전 모의고사는
        <br />
        실전과 최대한 비슷한 환경으로 진행돼요
      </p>
    </div>
  );
}
