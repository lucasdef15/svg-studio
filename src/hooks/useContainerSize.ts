import { type RefObject, useEffect, useState } from "react";

import type { Size } from "../lib/geometry";

const INITIAL_SIZE: Size = { height: 0, width: 0 };

export function useContainerSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>(INITIAL_SIZE);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { height, width } = entry.contentRect;
      setSize({ height, width });
    });

    observer.observe(element);
    setSize({
      height: element.clientHeight,
      width: element.clientWidth,
    });

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
