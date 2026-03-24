import { Outlet } from "react-router-dom";

export function ExamLayout() {
  return (
    <div className="h-dvh w-dvw flex flex-col overflow-hidden bg-background">
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
