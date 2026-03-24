import { useMutation } from "@tanstack/react-query";
import { examService } from "@/lib/api/examService";
import type { ExamSubmitRequest, ExamSubmitResponse } from "@/lib/types/exam";

export function useSubmitExamMutation() {
  return useMutation<ExamSubmitResponse, Error, ExamSubmitRequest>({
    mutationFn: (data) => examService.submitAnswers(data),
  });
}
