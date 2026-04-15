import { useEffect } from "react";

const EDGE_THRESHOLD = 30;
const MIN_SWIPE_X = 72;
const MAX_SWIPE_Y = 60;

export function useSwipeBack(onBack: () => void) {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isEdgeSwipe = false;

    function onTouchStart(event: TouchEvent) {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      isEdgeSwipe = startX < EDGE_THRESHOLD;
    }

    function onTouchEnd(event: TouchEvent) {
      if (!isEdgeSwipe) return;
      const dx = event.changedTouches[0].clientX - startX;
      const dy = Math.abs(event.changedTouches[0].clientY - startY);
      if (dx > MIN_SWIPE_X && dy < MAX_SWIPE_Y) {
        onBack();
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onBack]);
}
