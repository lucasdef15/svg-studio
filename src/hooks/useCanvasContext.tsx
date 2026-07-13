import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  GRID_SIZE,
  GRID_SUBDIVISIONS,
  ZOOM_MIN,
  ZOOM_MAX,
} from "../constants/canvas";
import { screenToCanvas, snapToGrid, type Point } from "../lib/geometry";

export interface Viewport {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

interface CanvasContextValue {
  readonly viewport: Viewport;
  readonly setViewport: Dispatch<SetStateAction<Viewport>>;
  readonly showGrid: boolean;
  readonly setShowGrid: Dispatch<SetStateAction<boolean>>;
  readonly snapToGrid: boolean;
  readonly setSnapToGrid: Dispatch<SetStateAction<boolean>>;
  readonly mousePos: Point;
  readonly setMousePos: Dispatch<SetStateAction<Point>>;
  readonly gridSize: number;
  readonly gridSubdivisions: number;
}

interface CanvasInteraction {
  readonly screenToCanvas: (
    screenX: number,
    screenY: number,
    containerRect: DOMRect,
  ) => Point;
  readonly applySnap: (coord: number) => number;
  readonly clampZoom: (zoom: number) => number;
}

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(true);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });

  const value = useMemo<CanvasContextValue>(
    () => ({
      viewport,
      setViewport,
      showGrid,
      setShowGrid,
      snapToGrid: snapToGridEnabled,
      setSnapToGrid: setSnapToGridEnabled,
      mousePos,
      setMousePos,
      gridSize: GRID_SIZE,
      gridSubdivisions: GRID_SUBDIVISIONS,
    }),
    [viewport, showGrid, snapToGridEnabled, mousePos],
  );

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

export function useCanvas(): CanvasContextValue & CanvasInteraction {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within CanvasProvider");
  }

  const { viewport, snapToGrid: snapEnabled, gridSize, gridSubdivisions } =
    context;

  const screenToCanvasCoords = useCallback(
    (screenX: number, screenY: number, containerRect: DOMRect) =>
      screenToCanvas(screenX, screenY, containerRect, viewport),
    [viewport],
  );

  const applySnap = useCallback(
    (coord: number) =>
      snapToGrid(coord, gridSize, gridSubdivisions, snapEnabled),
    [snapEnabled, gridSize, gridSubdivisions],
  );

  const clampZoom = useCallback(
    (zoom: number) => Math.min(Math.max(zoom, ZOOM_MIN), ZOOM_MAX),
    [],
  );

  return {
    ...context,
    screenToCanvas: screenToCanvasCoords,
    applySnap,
    clampZoom,
  };
}
