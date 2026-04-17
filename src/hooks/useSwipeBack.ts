import { useSwipeGesture } from "./useSwipeGesture";

export function useSwipeBack(onBack: () => void) {
  useSwipeGesture(onBack);
}
