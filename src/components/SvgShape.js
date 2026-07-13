import { jsx as _jsx } from "react/jsx-runtime";
export function SvgShape({ element }) {
    const { fill, stroke, strokeWidth } = element;
    switch (element.type) {
        case "circle":
            return (_jsx("circle", { cx: element.cx, cy: element.cy, fill: fill, r: element.r, stroke: stroke, strokeWidth: strokeWidth }));
        case "ellipse":
            return (_jsx("ellipse", { cx: element.cx, cy: element.cy, fill: fill, rx: element.rx, ry: element.ry, stroke: stroke, strokeWidth: strokeWidth }));
        case "path":
            return _jsx("path", { d: element.path, fill: fill, stroke: stroke, strokeWidth: strokeWidth });
        case "rect":
            return (_jsx("rect", { fill: fill, height: element.height, stroke: stroke, strokeWidth: strokeWidth, width: element.width, x: element.x, y: element.y }));
    }
}
