import type { SvgElement } from "../hooks/useSvgElement";
import type { Viewport } from "../hooks/useCanvasContext";

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Bounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface VisibleBounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export function getElementBounds(element: SvgElement): Bounds | null {
  switch (element.type) {
    case "rect":
      return {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      };
    case "circle":
      return {
        x: element.cx - element.r,
        y: element.cy - element.r,
        width: element.r * 2,
        height: element.r * 2,
      };
    case "ellipse":
      return {
        x: element.cx - element.rx,
        y: element.cy - element.ry,
        width: element.rx * 2,
        height: element.ry * 2,
      };
    case "path":
      return null;
  }
}

export function getVisibleCanvasBounds(
  container: Size,
  viewport: Viewport,
  padding = 0,
): VisibleBounds {
  const { x: offsetX, y: offsetY, zoom } = viewport;

  return {
    minX: -offsetX / zoom - padding,
    minY: -offsetY / zoom - padding,
    maxX: (container.width - offsetX) / zoom + padding,
    maxY: (container.height - offsetY) / zoom + padding,
  };
}

export function screenToCanvas(
  screenX: number,
  screenY: number,
  containerRect: DOMRect,
  viewport: Viewport,
): Point {
  return {
    x: (screenX - containerRect.left - viewport.x) / viewport.zoom,
    y: (screenY - containerRect.top - viewport.y) / viewport.zoom,
  };
}

export function canvasToScreen(point: Point, viewport: Viewport): Point {
  return {
    x: point.x * viewport.zoom + viewport.x,
    y: point.y * viewport.zoom + viewport.y,
  };
}

export function snapToGrid(
  coord: number,
  gridSize: number,
  subdivisions: number,
  enabled: boolean,
): number {
  if (!enabled) return coord;
  const step = gridSize / subdivisions;
  return Math.round(coord / step) * step;
}
