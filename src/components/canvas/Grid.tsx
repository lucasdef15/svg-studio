/* eslint-disable import-x/no-unresolved */
import { useMemo } from "react";

import { GRID_MAJOR_STROKE, GRID_MINOR_STROKE } from "../../constants/canvas";
import { useCanvas } from "../../hooks/useCanvasContext";
import { getVisibleCanvasBounds, type Size } from "../../lib/geometry";

interface GridProps {
  readonly containerSize: Size;
}

export function Grid({ containerSize }: GridProps) {
  const { gridSize, gridSubdivisions, showGrid, viewport } = useCanvas();

  const bounds = useMemo(
    () => getVisibleCanvasBounds(containerSize, viewport, gridSize),
    [containerSize, viewport, gridSize],
  );

  if (!showGrid || containerSize.width === 0) return null;

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const subSize = gridSize / gridSubdivisions;

  return (
    <>
      <defs>
        <pattern height={gridSize} id="gridPattern" patternUnits="userSpaceOnUse" width={gridSize}>
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke={GRID_MAJOR_STROKE}
            strokeWidth="1"
          />
          <path
            d={`M ${subSize} 0 L 0 0 0 ${subSize}`}
            fill="none"
            stroke={GRID_MINOR_STROKE}
            strokeWidth="0.2"
          />
        </pattern>
      </defs>
      <rect
        fill="url(#gridPattern)"
        height={height}
        width={width}
        x={bounds.minX}
        y={bounds.minY}
      />
    </>
  );
}
