import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable import-x/no-unresolved */
import { useMemo } from "react";
import { CROSSHAIR_STROKE, CROSSHAIR_STROKE_DASH } from "../../constants/canvas";
import { useCanvas } from "../../hooks/useCanvasContext";
import { getVisibleCanvasBounds } from "../../lib/geometry";
export function Crosshair({ containerSize }) {
    const { mousePos, viewport } = useCanvas();
    const bounds = useMemo(() => getVisibleCanvasBounds(containerSize, viewport), [containerSize, viewport]);
    if (containerSize.width === 0)
        return null;
    const strokeWidth = 1 / viewport.zoom;
    return (_jsxs(_Fragment, { children: [_jsx("line", { pointerEvents: "none", stroke: CROSSHAIR_STROKE, strokeDasharray: CROSSHAIR_STROKE_DASH, strokeWidth: strokeWidth, x1: bounds.minX, x2: bounds.maxX, y1: mousePos.y, y2: mousePos.y }), _jsx("line", { pointerEvents: "none", stroke: CROSSHAIR_STROKE, strokeDasharray: CROSSHAIR_STROKE_DASH, strokeWidth: strokeWidth, x1: mousePos.x, x2: mousePos.x, y1: bounds.minY, y2: bounds.maxY })] }));
}
