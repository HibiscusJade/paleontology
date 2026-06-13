import * as React from "react";

interface UseCompositionOptions<T extends HTMLElement> {
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (e: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (e: React.CompositionEvent<T>) => void;
}

interface UseCompositionReturn<T extends HTMLElement> {
  onCompositionStart: (e: React.CompositionEvent<T>) => void;
  onCompositionEnd: (e: React.CompositionEvent<T>) => void;
  onKeyDown: (e: React.KeyboardEvent<T>) => void;
}

export function useComposition<T extends HTMLElement>(
  options: UseCompositionOptions<T>
): UseCompositionReturn<T> {
  const isComposingRef = React.useRef(false);

  const onCompositionStart = (e: React.CompositionEvent<T>) => {
    isComposingRef.current = true;
    options.onCompositionStart?.(e);
  };

  const onCompositionEnd = (e: React.CompositionEvent<T>) => {
    isComposingRef.current = false;
    options.onCompositionEnd?.(e);
  };

  const onKeyDown = (e: React.KeyboardEvent<T>) => {
    if ((e.nativeEvent as any).isComposing || isComposingRef.current) {
      return;
    }
    options.onKeyDown?.(e);
  };

  return {
    onCompositionStart,
    onCompositionEnd,
    onKeyDown,
  };
}
