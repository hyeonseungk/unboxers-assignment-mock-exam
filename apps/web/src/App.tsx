import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryProvider } from "@/providers/QueryProvider";
import { ExamLayout } from "@/layouts/ExamLayout";
import { TutorialPage } from "@/pages/TutorialPage";
import { OmrPage } from "@/pages/OmrPage";
import { ResultPage } from "@/pages/ResultPage";

const router = createBrowserRouter([
  {
    element: <ExamLayout />,
    children: [
      { path: "/", element: <TutorialPage /> },
      { path: "/exam", element: <OmrPage /> },
    ],
  },
  {
    path: "/result",
    element: <ResultPage />,
  },
]);

export default function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  );
}
