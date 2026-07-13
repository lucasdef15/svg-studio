import { useEffect, useState, type RefObject } from "react";
import type { Size } from "../lib/geometry";

const INITIAL_SIZE: Size = { width: 0, height: 0 };

export function useContainerSize(
  ref: RefObject<HTMLElement | null>,
): Size {
  const [size, setSize] = useState<Size>(INITIAL_SIZE);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(element);
    setSize({
      width: element.clientWidth,
      height: element.clientHeight,
    });

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
