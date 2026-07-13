import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable import-x/no-unresolved */
import { useMemo } from "react";
import { GRID_SIZE, RULER_STROKE, RULER_THICKNESS } from "../../constants/canvas";
import { useCanvas } from "../../hooks/useCanvasContext";
import { getVisibleCanvasBounds } from "../../lib/geometry";
export function Rulers({ containerSize }) {
    const { viewport } = useCanvas();
    const horizontalTicks = useMemo(() => buildTicks("horizontal", containerSize, viewport, GRID_SIZE), [containerSize, viewport]);
    const verticalTicks = useMemo(() => buildTicks("vertical", containerSize, viewport, GRID_SIZE), [containerSize, viewport]);
    if (containerSize.width === 0)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("svg", { className: "absolute top-0 left-0 w-full  bg-slate-900 border-b border-slate-700 z-20 pointer-events-none", style: { height: RULER_THICKNESS }, children: horizontalTicks }), _jsx("svg", { className: "absolute top-0 left-0 bg-slate-900 border-r border-slate-700 z-20 pointer-events-none", style: { height: containerSize.height, width: RULER_THICKNESS }, children: verticalTicks })] }));
}
function buildTicks(orientation, containerSize, viewport, step) {
    const bounds = getVisibleCanvasBounds(containerSize, viewport, step);
    const axisMin = orientation === "horizontal" ? bounds.minX : bounds.minY;
    const axisMax = orientation === "horizontal" ? bounds.maxX : bounds.maxY;
    const containerLimit = orientation === "horizontal" ? containerSize.width : containerSize.height;
    const offset = orientation === "horizontal" ? viewport.x : viewport.y;
    const start = Math.floor(axisMin / step) * step;
    const end = Math.ceil(axisMax / step) * step;
    const ticks = [];
    for (let value = start; value <= end; value += step) {
        const screenPos = value * viewport.zoom + offset;
        if (screenPos < RULER_THICKNESS || screenPos > containerLimit)
            continue;
        ticks.push(_jsxs("g", { transform: orientation === "horizontal" ? `translate(${screenPos}, 0)` : `translate(0, ${screenPos})`, children: [_jsx("line", { stroke: RULER_STROKE, strokeWidth: "1", x1: "0", x2: orientation === "horizontal" ? "0" : String(RULER_THICKNESS), y1: "0", y2: orientation === "horizontal" ? String(RULER_THICKNESS) : "0" }), _jsx("text", { className: "select-none pointer-events-none", fill: RULER_STROKE, fontSize: "10", transform: orientation === "vertical" ? "rotate(-90 2 12)" : undefined, x: orientation === "vertical" ? -10 : 5, y: orientation === "vertical" ? 25 : 15, children: value })] }, `${orientation}-${value}`));
    }
    return ticks;
}
