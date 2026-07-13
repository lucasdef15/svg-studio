const BASE_STYLE = {
    fill: "#4FA7D8",
    stroke: "#ffffff",
    strokeWidth: 2,
    type: "rect",
};
export function createDefaultElement(type, style) {
    const base = { ...BASE_STYLE, ...style };
    switch (type) {
        case "circle":
            return {
                ...base,
                cx: 150,
                cy: 150,
                r: 80,
                type: "circle",
            };
        case "ellipse":
            return {
                ...base,
                cx: 150,
                cy: 150,
                rx: 100,
                ry: 60,
                type: "ellipse",
            };
        case "path":
            return {
                ...base,
                path: "M 50 50 Q 100 20 150 50 Q 180 100 150 150 Q 100 180 50 150 Z",
                type: "path",
            };
        case "rect":
            return {
                ...base,
                height: 200,
                type: "rect",
                width: 200,
                x: 50,
                y: 50,
            };
    }
}
