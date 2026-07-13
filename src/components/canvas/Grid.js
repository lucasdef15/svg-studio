import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* eslint-disable import-x/no-unresolved */
import { useMemo } from "react";
import { GRID_MAJOR_STROKE, GRID_MINOR_STROKE } from "../../constants/canvas";
import { useCanvas } from "../../hooks/useCanvasContext";
import { getVisibleCanvasBounds } from "../../lib/geometry";
export function Grid({ containerSize }) {
    const { gridSize, gridSubdivisions, showGrid, viewport } = useCanvas();
    const bounds = useMemo(() => getVisibleCanvasBounds(containerSize, viewport, gridSize), [containerSize, viewport, gridSize]);
    if (!showGrid || containerSize.width === 0)
        return null;
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const subSize = gridSize / gridSubdivisions;
    return (_jsxs(_Fragment, { children: [_jsx("defs", { children: _jsxs("pattern", { height: gridSize, id: "gridPattern", patternUnits: "userSpaceOnUse", width: gridSize, children: [_jsx("path", { d: `M ${gridSize} 0 L 0 0 0 ${gridSize}`, fill: "none", stroke: GRID_MAJOR_STROKE, strokeWidth: "1" }), _jsx("path", { d: `M ${subSize} 0 L 0 0 0 ${subSize}`, fill: "none", stroke: GRID_MINOR_STROKE, strokeWidth: "0.2" })] }) }), _jsx("rect", { fill: "url(#gridPattern)", height: height, width: width, x: bounds.minX, y: bounds.minY })] }));
}
