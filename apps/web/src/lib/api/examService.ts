import { httpRequester } from "./client";
import type {
  ExamInfo,
  ExamSubmitRequest,
  ExamSubmitResponse,
} from "../types/exam";

export const examService = {
  getExamInfo(): Promise<ExamInfo> {
    return httpRequester<ExamInfo>("/api/exams");
  },

  submitAnswers(data: ExamSubmitRequest): Promise<ExamSubmitResponse> {
    return httpRequester<ExamSubmitResponse>("/api/exams/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
