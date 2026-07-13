import type { MouseEvent } from "react";
import { useCanvas } from "../../hooks/useCanvasContext";
import {
  HANDLE_OFFSET,
  HANDLE_SIZE,
  SELECTION_COLOR,
  SELECTION_STROKE_DASH,
} from "../../constants/canvas";
import { getElementBounds } from "../../lib/geometry";
import type { SvgElement } from "../../hooks/useSvgElement";

export type ResizeHandleId = "nw" | "ne" | "sw" | "se";

const HANDLE_POSITIONS: ReadonlyArray<{
  readonly id: ResizeHandleId;
  readonly xFactor: number;
  readonly yFactor: number;
}> = [
  { id: "nw", xFactor: 0, yFactor: 0 },
  { id: "ne", xFactor: 1, yFactor: 0 },
  { id: "sw", xFactor: 0, yFactor: 1 },
  { id: "se", xFactor: 1, yFactor: 1 },
];

interface SelectionOverlayProps {
  readonly element: SvgElement;
  readonly onResizeStart: (
    handle: ResizeHandleId,
    event: MouseEvent<SVGRectElement>,
  ) => void;
}

export function SelectionOverlay({
  element,
  onResizeStart,
}: SelectionOverlayProps) {
  const { viewport } = useCanvas();
  const bounds = getElementBounds(element);

  if (!bounds) return null;

  const handleSize = HANDLE_SIZE / viewport.zoom;
  const handleOffset = HANDLE_OFFSET / viewport.zoom;
  const strokeWidth = 1 / viewport.zoom;

  return (
    <g transform={`translate(${bounds.x}, ${bounds.y})`} pointerEvents="none">
      <rect
        width={bounds.width}
        height={bounds.height}
        fill="none"
        stroke={SELECTION_COLOR}
        strokeWidth={strokeWidth}
        strokeDasharray={SELECTION_STROKE_DASH}
      />
      {HANDLE_POSITIONS.map((handle) => (
        <rect
          key={handle.id}
          x={bounds.width * handle.xFactor - handleOffset}
          y={bounds.height * handle.yFactor - handleOffset}
          width={handleSize}
          height={handleSize}
          fill="white"
          stroke={SELECTION_COLOR}
          strokeWidth={strokeWidth}
          className="cursor-pointer"
          pointerEvents="all"
          onMouseDown={(event) => {
            event.stopPropagation();
            onResizeStart(handle.id, event);
          }}
        />
      ))}
    </g>
  );
}
