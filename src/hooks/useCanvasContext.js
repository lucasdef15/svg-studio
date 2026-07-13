import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable import-x/no-unresolved */
import { createContext, useCallback, useContext, useMemo, useState, } from "react";
import { GRID_SIZE, GRID_SUBDIVISIONS, ZOOM_MAX, ZOOM_MIN } from "../constants/canvas";
import { screenToCanvas, snapToGrid } from "../lib/geometry";
const CanvasContext = createContext(undefined);
export function CanvasProvider({ children }) {
    const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
    const [showGrid, setShowGrid] = useState(true);
    const [snapToGridEnabled, setSnapToGridEnabled] = useState(true);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const value = useMemo(() => ({
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
    }), [viewport, showGrid, snapToGridEnabled, mousePos]);
    return _jsx(CanvasContext.Provider, { value: value, children: children });
}
export function useCanvas() {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error("useCanvas must be used within CanvasProvider");
    }
    const { gridSize, gridSubdivisions, snapToGrid: snapEnabled, viewport } = context;
    const screenToCanvasCoords = useCallback((screenX, screenY, containerRect) => screenToCanvas(screenX, screenY, containerRect, viewport), [viewport]);
    const applySnap = useCallback((coord) => snapToGrid(coord, gridSize, gridSubdivisions, snapEnabled), [snapEnabled, gridSize, gridSubdivisions]);
    const clampZoom = useCallback((zoom) => Math.min(Math.max(zoom, ZOOM_MIN), ZOOM_MAX), []);
    return {
        ...context,
        applySnap,
        clampZoom,
        screenToCanvas: screenToCanvasCoords,
    };
}
