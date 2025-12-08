import {elementScroll, VirtualizerOptions} from '@tanstack/react-virtual';
import {Task} from './types';

export const isSimpleTask = (task: Task) => {
  return (
    task.blocks_notifications.length === 1 &&
    !task.is_created &&
    (task.blocks_notifications[0] === 1 || task.blocks_notifications[0] === 207)
  );
};

export const createSmoothScrollToFn = (
  getScrollElement: () => HTMLElement | null,
  duration: number = 1000
): VirtualizerOptions<any, any>['scrollToFn'] => {
  let scrollingRef = 0;

  function easeInOutQuint(t: number) {
    return t < 0.5 ? 16 * t ** 5 : 1 + 16 * (--t) ** 5;
  }

  return (offset, canSmooth, instance) => {
    const start = getScrollElement()?.scrollTop || 0;
    const startTime = (scrollingRef = Date.now());

    const run = () => {
      if (scrollingRef !== startTime) return;
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = easeInOutQuint(Math.min(elapsed / duration, 1));
      const interpolated = start + (offset - start) * progress;

      elementScroll(interpolated, canSmooth, instance);
      if (elapsed < duration) requestAnimationFrame(run);
    };

    requestAnimationFrame(run);
  };
};
