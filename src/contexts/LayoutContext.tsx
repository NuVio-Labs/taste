import { createContext, useContext } from "react";

type LayoutContextValue = {
  openFeedback: () => void;
  openUpgrade: () => void;
};

export const LayoutContext = createContext<LayoutContextValue>({
  openFeedback: () => {},
  openUpgrade: () => {},
});

export function useLayout() {
  return useContext(LayoutContext);
}
