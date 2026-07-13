export function canvasToScreen(point, viewport) {
    return {
        x: point.x * viewport.zoom + viewport.x,
        y: point.y * viewport.zoom + viewport.y,
    };
}
export function getElementBounds(element) {
    switch (element.type) {
        case "circle":
            return {
                height: element.r * 2,
                width: element.r * 2,
                x: element.cx - element.r,
                y: element.cy - element.r,
            };
        case "ellipse":
            return {
                height: element.ry * 2,
                width: element.rx * 2,
                x: element.cx - element.rx,
                y: element.cy - element.ry,
            };
        case "path":
            return null;
        case "rect":
            return {
                height: element.height,
                width: element.width,
                x: element.x,
                y: element.y,
            };
    }
}
export function getVisibleCanvasBounds(container, viewport, padding = 0) {
    const { x: offsetX, y: offsetY, zoom } = viewport;
    return {
        maxX: (container.width - offsetX) / zoom + padding,
        maxY: (container.height - offsetY) / zoom + padding,
        minX: -offsetX / zoom - padding,
        minY: -offsetY / zoom - padding,
    };
}
export function screenToCanvas(screenX, screenY, containerRect, viewport) {
    return {
        x: (screenX - containerRect.left - viewport.x) / viewport.zoom,
        y: (screenY - containerRect.top - viewport.y) / viewport.zoom,
    };
}
export function snapToGrid(coord, gridSize, subdivisions, enabled) {
    if (!enabled)
        return coord;
    const step = gridSize / subdivisions;
    return Math.round(coord / step) * step;
}
