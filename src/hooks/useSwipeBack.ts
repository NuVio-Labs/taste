import { useEffect } from "react";

const EDGE_THRESHOLD = 44;
const MIN_SWIPE_X = 56;
const MAX_SWIPE_Y_RATIO = 0.6;

export function useSwipeBack(onBack: () => void) {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isTracking = false;
    let moved = false;

    function onTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isTracking = startX < EDGE_THRESHOLD;
      moved = false;
    }

    function onTouchMove(event: TouchEvent) {
      if (!isTracking) return;
      const touch = event.touches[0];
      const dx = touch.clientX - startX;
      const dy = Math.abs(touch.clientY - startY);
      if (dx > 10) moved = true;
      // Cancel tracking if mostly vertical
      if (dy > dx * 1.5 && dy > 20) isTracking = false;
    }

    function onTouchEnd(event: TouchEvent) {
      if (!isTracking || !moved) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = Math.abs(touch.clientY - startY);
      if (dx > MIN_SWIPE_X && dy < dx * MAX_SWIPE_Y_RATIO) {
        onBack();
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onBack]);
}
