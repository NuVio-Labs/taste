import { useEffect } from "react";

type SwipeGestureOptions = {
  /** X position threshold from left edge to start tracking (default: 44) */
  edgeThreshold?: number;
  /** Minimum horizontal swipe distance to trigger (default: 56) */
  minSwipeX?: number;
  /** Only track when drawer/panel is closed (default: true) */
  onlyWhenClosed?: boolean;
  isOpen?: boolean;
};

export function useSwipeGesture(
  onSwipeRight: () => void,
  options: SwipeGestureOptions = {},
) {
  const {
    edgeThreshold = 44,
    minSwipeX = 56,
    onlyWhenClosed = false,
    isOpen = false,
  } = options;

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isTracking = false;
    let moved = false;

    function onTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isTracking = (!onlyWhenClosed || !isOpen) && startX < edgeThreshold;
      moved = false;
    }

    function onTouchMove(event: TouchEvent) {
      if (!isTracking) return;
      const touch = event.touches[0];
      const dx = touch.clientX - startX;
      const dy = Math.abs(touch.clientY - startY);
      if (dx > 10) moved = true;
      if (dy > dx * 1.5 && dy > 20) isTracking = false;
    }

    function onTouchEnd(event: TouchEvent) {
      if (!isTracking || !moved) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = Math.abs(touch.clientY - startY);
      if (dx > minSwipeX && dy < dx * 0.6) {
        onSwipeRight();
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
  }, [onSwipeRight, edgeThreshold, minSwipeX, onlyWhenClosed, isOpen]);
}
