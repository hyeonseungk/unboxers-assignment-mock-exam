import { create } from "zustand";
import type { StudentInfo } from "@/lib/types/exam";

interface ExamState {
  studentInfo: StudentInfo | null;
  objectiveAnswers: Record<number, number>;
  subjectiveAnswers: Record<number, string>;
  examStarted: boolean;
  examStartedAt: number | null;

  setStudentInfo: (info: StudentInfo) => void;
  setObjectiveAnswer: (questionNumber: number, choice: number) => void;
  clearObjectiveAnswer: (questionNumber: number) => void;
  setSubjectiveAnswer: (questionNumber: number, value: string) => void;
  clearSubjectiveAnswer: (questionNumber: number) => void;
  startExam: () => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  studentInfo: null,
  objectiveAnswers: {},
  subjectiveAnswers: {},
  examStarted: false,
  examStartedAt: null,

  setStudentInfo: (info) => set({ studentInfo: info }),

  setObjectiveAnswer: (questionNumber, choice) =>
    set((state) => {
      if (state.objectiveAnswers[questionNumber] === choice) {
        const next = { ...state.objectiveAnswers };
        delete next[questionNumber];
        return { objectiveAnswers: next };
      }
      return {
        objectiveAnswers: { ...state.objectiveAnswers, [questionNumber]: choice },
      };
    }),

  clearObjectiveAnswer: (questionNumber) =>
    set((state) => {
      const next = { ...state.objectiveAnswers };
      delete next[questionNumber];
      return { objectiveAnswers: next };
    }),

  setSubjectiveAnswer: (questionNumber, value) =>
    set((state) => ({
      subjectiveAnswers: { ...state.subjectiveAnswers, [questionNumber]: value },
    })),

  clearSubjectiveAnswer: (questionNumber) =>
    set((state) => {
      const next = { ...state.subjectiveAnswers };
      delete next[questionNumber];
      return { subjectiveAnswers: next };
    }),

  startExam: () => set({ examStarted: true, examStartedAt: Date.now() }),

  resetExam: () =>
    set({
      studentInfo: null,
      objectiveAnswers: {},
      subjectiveAnswers: {},
      examStarted: false,
      examStartedAt: null,
    }),
}));
