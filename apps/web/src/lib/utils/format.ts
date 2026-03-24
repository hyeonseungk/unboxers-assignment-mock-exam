/** MM:SS 또는 HH:MM:SS 형식으로 변환 */
export function formatTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

/** 점수 표시: "85/100" */
export function formatScore(score: number, total: number): string {
  return `${score}/${total}`;
}

/** 정답률 표시: "85%" 또는 "85.6%" */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}
