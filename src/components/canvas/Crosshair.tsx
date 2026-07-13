/* eslint-disable import-x/no-unresolved */
import { useMemo } from "react";

import { CROSSHAIR_STROKE, CROSSHAIR_STROKE_DASH } from "../../constants/canvas";
import { useCanvas } from "../../hooks/useCanvasContext";
import { getVisibleCanvasBounds, type Size } from "../../lib/geometry";

interface CrosshairProps {
  readonly containerSize: Size;
}

export function Crosshair({ containerSize }: CrosshairProps) {
  const { mousePos, viewport } = useCanvas();

  const bounds = useMemo(
    () => getVisibleCanvasBounds(containerSize, viewport),
    [containerSize, viewport],
  );

  if (containerSize.width === 0) return null;

  const strokeWidth = 1 / viewport.zoom;

  return (
    <>
      <line
        pointerEvents="none"
        stroke={CROSSHAIR_STROKE}
        strokeDasharray={CROSSHAIR_STROKE_DASH}
        strokeWidth={strokeWidth}
        x1={bounds.minX}
        x2={bounds.maxX}
        y1={mousePos.y}
        y2={mousePos.y}
      />
      <line
        pointerEvents="none"
        stroke={CROSSHAIR_STROKE}
        strokeDasharray={CROSSHAIR_STROKE_DASH}
        strokeWidth={strokeWidth}
        x1={mousePos.x}
        x2={mousePos.x}
        y1={bounds.minY}
        y2={bounds.maxY}
      />
    </>
  );
}
