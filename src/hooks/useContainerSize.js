import { useEffect, useState } from "react";
const INITIAL_SIZE = { height: 0, width: 0 };
export function useContainerSize(ref) {
    const [size, setSize] = useState(INITIAL_SIZE);
    useEffect(() => {
        const element = ref.current;
        if (!element)
            return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry)
                return;
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
