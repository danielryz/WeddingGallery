import { useState, useRef } from 'react';

interface Options {
  delay?: number;
}

/**
 * Hook that exposes handlers for mouse/touch long press to open a reaction selector.
 */
export function useLongPressReaction(options?: Options) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delay = options?.delay ?? 400;

  const start = () => {
    timeoutRef.current = setTimeout(() => setShow(true), delay);
  };

  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const close = () => setShow(false);
  const open = () => setShow(true);

  const handlers = {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  } as const;

  return { show, handlers, close, open };
}
export default useLongPressReaction;
