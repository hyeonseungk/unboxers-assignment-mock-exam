import { apiFetch } from "./client";
import type {
  ExamInfo,
  ExamSubmitRequest,
  ExamSubmitResponse,
} from "../types/exam";

export const examService = {
  getExamInfo(): Promise<ExamInfo> {
    return apiFetch<ExamInfo>("/api/exams");
  },

  submitAnswers(data: ExamSubmitRequest): Promise<ExamSubmitResponse> {
    return apiFetch<ExamSubmitResponse>("/api/exams/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
