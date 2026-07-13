// eslint-disable-next-line import-x/no-unresolved
import { useCanvas } from "../../hooks/useCanvasContext";

export function CoordinateDisplay() {
  const { mousePos, viewport } = useCanvas();

  return (
    <div className="absolute bottom-4 right-4 bg-slate-900/80 text-slate-300 px-3 py-1 rounded text-xs font-mono z-30 border border-slate-700 pointer-events-none">
      X: {mousePos.x} Y: {mousePos.y} | {(viewport.zoom * 100).toFixed(0)}%
    </div>
  );
}
