/* eslint-disable react-refresh/only-export-components */
/* eslint-disable import-x/no-unresolved */
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { GRID_SIZE, GRID_SUBDIVISIONS, ZOOM_MAX, ZOOM_MIN } from "../constants/canvas";
import { type Point, screenToCanvas, snapToGrid } from "../lib/geometry";

export interface Viewport {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

interface CanvasContextValue {
  readonly gridSize: number;
  readonly gridSubdivisions: number;
  readonly mousePos: Point;
  readonly setMousePos: Dispatch<SetStateAction<Point>>;
  readonly setShowGrid: Dispatch<SetStateAction<boolean>>;
  readonly setSnapToGrid: Dispatch<SetStateAction<boolean>>;
  readonly setViewport: Dispatch<SetStateAction<Viewport>>;
  readonly showGrid: boolean;
  readonly snapToGrid: boolean;
  readonly viewport: Viewport;
}

interface CanvasInteraction {
  readonly applySnap: (coord: number) => number;
  readonly clampZoom: (zoom: number) => number;
  readonly screenToCanvas: (screenX: number, screenY: number, containerRect: DOMRect) => Point;
}

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(true);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });

  const value = useMemo<CanvasContextValue>(
    () => ({
      gridSize: GRID_SIZE,
      gridSubdivisions: GRID_SUBDIVISIONS,
      mousePos,
      setMousePos,
      setShowGrid,
      setSnapToGrid: setSnapToGridEnabled,
      setViewport,
      showGrid,
      snapToGrid: snapToGridEnabled,
      viewport,
    }),
    [viewport, showGrid, snapToGridEnabled, mousePos],
  );

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

export function useCanvas(): CanvasContextValue & CanvasInteraction {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within CanvasProvider");
  }

  const { gridSize, gridSubdivisions, snapToGrid: snapEnabled, viewport } = context;

  const screenToCanvasCoords = useCallback(
    (screenX: number, screenY: number, containerRect: DOMRect) =>
      screenToCanvas(screenX, screenY, containerRect, viewport),
    [viewport],
  );

  const applySnap = useCallback(
    (coord: number) => snapToGrid(coord, gridSize, gridSubdivisions, snapEnabled),
    [snapEnabled, gridSize, gridSubdivisions],
  );

  const clampZoom = useCallback((zoom: number) => Math.min(Math.max(zoom, ZOOM_MIN), ZOOM_MAX), []);

  return {
    ...context,
    applySnap,
    clampZoom,
    screenToCanvas: screenToCanvasCoords,
  };
}
