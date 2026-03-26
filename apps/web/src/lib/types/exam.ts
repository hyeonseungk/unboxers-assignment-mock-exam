export interface StudentInfo {
  name: string;
  school: string;
  grade: number;
  studentNumber: number;
  seatNumber: number;
}

export type AnswerType = "objective" | "subjective";

export interface AnswerItem {
  answerType: AnswerType;
  number: number;
  answer: number;
}

export interface ExamInfo {
  title: string;
  description: string | null;
  supervisorName: string;
  totalQuestions: number;
  totalScore: number;
}

export type GradeResult = "correct" | "wrong" | "unanswered";

export interface ExamResultItem {
  answerType: AnswerType;
  number: number;
  result: GradeResult;
}

export interface ExamSubmitRequest {
  name: string;
  school: string;
  grade: number;
  studentNumber: number;
  seatNumber: number;
  answers: AnswerItem[];
}

export interface ExamSubmitResponse {
  title: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  results: ExamResultItem[];
}

export type ExamSubmitMode = "manual" | "timeout";

export interface ResultPreviewSnapshot {
  studentInfo: StudentInfo;
  objectiveAnswers: Record<number, number>;
  subjectiveAnswers: Record<number, string>;
}

export interface ResultPageState {
  resultData?: ExamSubmitResponse;
  submitMode?: ExamSubmitMode;
  previewSnapshot?: ResultPreviewSnapshot;
  submitPayload?: ExamSubmitRequest;
}
