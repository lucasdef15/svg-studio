import { useMemo } from "react";
import { useCanvas } from "../../hooks/useCanvasContext";
import { CROSSHAIR_STROKE, CROSSHAIR_STROKE_DASH } from "../../constants/canvas";
import { getVisibleCanvasBounds, type Size } from "../../lib/geometry";

interface CrosshairProps {
  readonly containerSize: Size;
}

export function Crosshair({ containerSize }: CrosshairProps) {
  const { viewport, mousePos } = useCanvas();

  const bounds = useMemo(
    () => getVisibleCanvasBounds(containerSize, viewport),
    [containerSize, viewport],
  );

  if (containerSize.width === 0) return null;

  const strokeWidth = 1 / viewport.zoom;

  return (
    <>
      <line
        x1={bounds.minX}
        y1={mousePos.y}
        x2={bounds.maxX}
        y2={mousePos.y}
        stroke={CROSSHAIR_STROKE}
        strokeWidth={strokeWidth}
        strokeDasharray={CROSSHAIR_STROKE_DASH}
        pointerEvents="none"
      />
      <line
        x1={mousePos.x}
        y1={bounds.minY}
        x2={mousePos.x}
        y2={bounds.maxY}
        stroke={CROSSHAIR_STROKE}
        strokeWidth={strokeWidth}
        strokeDasharray={CROSSHAIR_STROKE_DASH}
        pointerEvents="none"
      />
    </>
  );
}
