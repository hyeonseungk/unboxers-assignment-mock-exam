import { cn } from "@/lib/utils/cn";
import {
  OMR_BUBBLE_COLUMN_GAP,
  OMR_BUBBLE_SLOT_WIDTH,
  OMR_NUMBER_STRIP_GRID,
} from "./omrStyles";

export function OmrObjectiveFooterBars() {
  return (
    <div className="grid grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={`objective-footer-${index}`}
          className={cn(
            "grid min-w-0",
            OMR_NUMBER_STRIP_GRID,
            index > 0 && "border-l-[1.5px] border-transparent",
          )}
        >
          <div />
          <div className="px-[6px]">
            <BubbleAlignedFooterBars count={5} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BubbleAlignedFooterBars({ count }: { count: number }) {
  return (
    <div className={cn("flex items-end justify-center", OMR_BUBBLE_COLUMN_GAP)}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`footer-slot-${count}-${index}`}
          className={cn("flex justify-center", OMR_BUBBLE_SLOT_WIDTH)}
        >
          <FooterBar />
        </div>
      ))}
    </div>
  );
}

function FooterBar() {
  return <span className="h-[22px] w-[6px] rounded-[1px] bg-[#111111]" />;
}
