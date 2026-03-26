import { cn } from "@/lib/utils/cn";

type TutorialExamPaperIllustrationVariant = "intro" | "concept";

interface TutorialExamPaperIllustrationProps {
  variant?: TutorialExamPaperIllustrationVariant;
  className?: string;
}

const VARIANT_CONFIG = {
  intro: {
    container: "h-[322px] w-[226px]",
    layer: "h-[276px] w-[194px]",
    layerPositions: [
      "top-[6px] left-[24px]",
      "top-[10px] left-[20px]",
      "top-[14px] left-[16px]",
      "top-[18px] left-[12px]",
      "top-[22px] left-[8px]",
    ],
    frontCard: "left-0 top-[28px] h-[276px] w-[194px] px-7 pt-4 pb-5",
    subtitle: "text-[11px] font-extrabold tracking-[-0.03em] text-[#353535]",
    title: "mt-2 text-[25px] font-black tracking-[-0.05em] text-[#111111]",
    content: "mt-6 h-[182px] px-1",
    divider: "top-1",
    leftColumn: "w-[58px] gap-[17px]",
    rightColumn: "w-[58px] gap-[17px] pt-0.5",
    placeholder: "rounded-[6px] bg-[#ebe8e4]",
    leftHeights: ["h-[40px]", "h-[40px]", "h-[40px]"],
    rightHeights: ["h-[40px]", "h-[43px]"],
  },
  concept: {
    container: "h-[360px] w-[280px]",
    layer: "h-[330px] w-[256px]",
    layerPositions: [
      "top-0 left-[24px]",
      "top-[4px] left-[20px]",
      "top-[8px] left-[16px]",
      "top-[12px] left-[12px]",
      "top-[16px] left-[8px]",
    ],
    frontCard: "left-0 top-[24px] h-[330px] w-[256px] px-8 pt-5 pb-6",
    subtitle: "text-[13px] font-extrabold tracking-[-0.03em] text-[#353535]",
    title: "mt-2.5 text-[34px] font-black tracking-[-0.05em] text-[#111111]",
    content: "mt-7 h-[216px] px-1.5",
    divider: "top-1.5",
    leftColumn: "w-[76px] gap-[18px]",
    rightColumn: "w-[76px] gap-[18px] pt-1",
    placeholder: "rounded-[7px] bg-[#ebe8e4]",
    leftHeights: ["h-[42px]", "h-[42px]", "h-[42px]"],
    rightHeights: ["h-[42px]", "h-[46px]"],
  },
} as const;

export function TutorialExamPaperIllustration({
  variant = "intro",
  className,
}: TutorialExamPaperIllustrationProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <div className={cn("relative z-0", config.container, className)}>
      {config.layerPositions.map((positionClass) => (
        <div
          key={positionClass}
          className={cn(
            "absolute rounded-[12px] border border-[#f1efec] bg-white shadow-[0_12px_24px_rgba(17,24,39,0.06)]",
            config.layer,
            positionClass,
          )}
        />
      ))}

      <div
        className={cn(
          "absolute z-10 rounded-[12px] border border-[#ece9e5] bg-white shadow-[0_20px_40px_rgba(17,24,39,0.09),0_8px_18px_rgba(17,24,39,0.06)]",
          config.frontCard,
        )}
      >
        <div className="text-center leading-none">
          <p className={config.subtitle}>실전 모의고사</p>
          <p className={config.title}>공통수학2</p>
        </div>

        <div className={cn("relative flex justify-between", config.content)}>
          <div
            className={cn(
              "absolute bottom-0 left-1/2 w-px -translate-x-1/2 bg-[#ebe8e4]",
              config.divider,
            )}
          />

          <div className={cn("flex flex-col", config.leftColumn)}>
            {config.leftHeights.map((heightClass, index) => (
              <div
                key={`${heightClass}-${index}`}
                className={cn(config.placeholder, heightClass)}
              />
            ))}
          </div>

          <div className={cn("flex flex-col", config.rightColumn)}>
            {config.rightHeights.map((heightClass, index) => (
              <div
                key={`${heightClass}-${index}`}
                className={cn(config.placeholder, heightClass)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
