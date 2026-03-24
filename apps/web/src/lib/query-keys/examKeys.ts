export const examKeys = {
  all: ["exams"] as const,
  info: () => [...examKeys.all, "info"] as const,
};
