import { useRef, useState, type MouseEvent, type ReactNode, type WheelEvent } from "react";
import { useCanvas } from "../../hooks/useCanvasContext";
import { useContainerSize } from "../../hooks/useContainerSize";
import { useSpaceKey } from "../../hooks/useSpaceKey";
import { useSvgElement } from "../../hooks/useSvgElement";
import { ZOOM_WHEEL_SPEED } from "../../constants/canvas";
import type { Point } from "../../lib/geometry";
import { Rulers } from "./Rulers";
import { Grid } from "./Grid";
import { Crosshair } from "./Crosshair";
import { CoordinateDisplay } from "./CoordinateDisplay";
import { SelectionOverlay, type ResizeHandleId } from "./SelectionOverlay";

interface CanvasViewportProps {
  readonly children: ReactNode;
}

type InteractionMode = "idle" | "panning" | "dragging" | "resizing";

interface ResizeState {
  readonly handle: ResizeHandleId;
  readonly startCanvas: Point;
  readonly initial: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
}

export function CanvasViewport({ children }: CanvasViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useContainerSize(containerRef);
  const spacePressed = useSpaceKey();

  const {
    viewport,
    setViewport,
    showGrid,
    setShowGrid,
    mousePos,
    setMousePos,
    screenToCanvas,
    applySnap,
    clampZoom,
  } = useCanvas();

  const { element, patch } = useSvgElement();

  const [mode, setMode] = useState<InteractionMode>("idle");
  const [dragAnchor, setDragAnchor] = useState<Point>({ x: 0, y: 0 });
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);

  const getCanvasPoint = (event: MouseEvent): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return screenToCanvas(event.clientX, event.clientY, rect);
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const delta = -event.deltaY;
      const newZoom = clampZoom(viewport.zoom + delta * ZOOM_WHEEL_SPEED);

      setViewport({
        x: mouseX - (mouseX - viewport.x) * (newZoom / viewport.zoom),
        y: mouseY - (mouseY - viewport.y) * (newZoom / viewport.zoom),
        zoom: newZoom,
      });
      return;
    }

    setViewport((prev) => ({
      ...prev,
      x: prev.x - event.deltaX,
      y: prev.y - event.deltaY,
    }));
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (spacePressed) {
      setMode("panning");
      setDragAnchor({
        x: event.clientX - viewport.x,
        y: event.clientY - viewport.y,
      });
      return;
    }

    setMode("dragging");
    setDragAnchor(getCanvasPoint(event));
  };

  const handleResizeStart = (handle: ResizeHandleId, event: MouseEvent<SVGRectElement>) => {
    if (element.type !== "rect") return;

    setMode("resizing");
    setResizeState({
      handle,
      startCanvas: getCanvasPoint(event),
      initial: {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      },
    });
  };

  const applyRectResize = (current: Point) => {
    if (!resizeState) return;

    const dx = current.x - resizeState.startCanvas.x;
    const dy = current.y - resizeState.startCanvas.y;
    const { handle, initial } = resizeState;

    let x = initial.x;
    let y = initial.y;
    let width = initial.width;
    let height = initial.height;

    if (handle.includes("e")) width = initial.width + dx;
    if (handle.includes("s")) height = initial.height + dy;
    if (handle.includes("w")) {
      x = initial.x + dx;
      width = initial.width - dx;
    }
    if (handle.includes("n")) {
      y = initial.y + dy;
      height = initial.height - dy;
    }

    patch({
      x: applySnap(x),
      y: applySnap(y),
      width: applySnap(Math.max(width, 1)),
      height: applySnap(Math.max(height, 1)),
    });
  };

  const applyElementDrag = (current: Point) => {
    const dx = current.x - dragAnchor.x;
    const dy = current.y - dragAnchor.y;

    if (element.type === "rect") {
      patch({
        x: applySnap(element.x + dx),
        y: applySnap(element.y + dy),
      });
    } else if (element.type === "circle" || element.type === "ellipse") {
      patch({
        cx: applySnap(element.cx + dx),
        cy: applySnap(element.cy + dy),
      });
    }

    setDragAnchor(current);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const canvasPoint = getCanvasPoint(event);
    setMousePos({
      x: Math.round(canvasPoint.x),
      y: Math.round(canvasPoint.y),
    });

    if (mode === "panning") {
      setViewport((prev) => ({
        ...prev,
        x: event.clientX - dragAnchor.x,
        y: event.clientY - dragAnchor.y,
      }));
      return;
    }

    if (mode === "resizing") {
      applyRectResize(canvasPoint);
      return;
    }

    if (mode === "dragging") {
      applyElementDrag(canvasPoint);
    }
  };

  const handleMouseUp = () => {
    setMode("idle");
    setResizeState(null);
  };

  const cursorClass = spacePressed
    ? "cursor-grab active:cursor-grabbing"
    : mode === "dragging" || mode === "resizing"
      ? "cursor-move"
      : "cursor-crosshair";

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 min-h-0 w-full bg-slate-950 overflow-hidden border border-slate-800 rounded-lg shadow-2xl ${cursorClass}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Rulers containerSize={containerSize} />
      <CoordinateDisplay />

      <button
        type="button"
        onClick={() => setShowGrid((prev) => !prev)}
        className="absolute bottom-4 left-10 bg-slate-900/80 text-slate-300 px-3 py-1 rounded text-xs z-30 border border-slate-700 hover:bg-slate-800"
      >
        Grid: {showGrid ? "ON" : "OFF"}
      </button>

      <svg className="w-full h-full">
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
          <Grid containerSize={containerSize} />
          <Crosshair containerSize={containerSize} />
          {children}
          <SelectionOverlay element={element} onResizeStart={handleResizeStart} />
        </g>
      </svg>
    </div>
  );
}
