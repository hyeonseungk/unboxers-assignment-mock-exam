import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export function ModalPortal({ children }: { children: ReactNode }) {
  const container = document.getElementById("modal-root");
  if (!container) return null;
  return createPortal(children, container);
}
