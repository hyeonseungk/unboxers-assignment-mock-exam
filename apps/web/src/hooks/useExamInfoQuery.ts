import { useQuery } from "@tanstack/react-query";
import { examKeys } from "@/lib/query-keys/examKeys";
import { examService } from "@/lib/api/examService";

export function useExamInfoQuery() {
  return useQuery({
    queryKey: examKeys.info(),
    queryFn: () => examService.getExamInfo(),
  });
}
