import type {
  BaseSvgElement,
  SvgElement,
  SvgElementType,
} from "../hooks/useSvgElement";

const BASE_STYLE: Readonly<BaseSvgElement> = {
  type: "rect",
  fill: "#4FA7D8",
  stroke: "#ffffff",
  strokeWidth: 2,
};

export function createDefaultElement(
  type: SvgElementType,
  style?: Partial<Pick<BaseSvgElement, "fill" | "stroke" | "strokeWidth">>,
): SvgElement {
  const base = { ...BASE_STYLE, ...style };

  switch (type) {
    case "rect":
      return {
        ...base,
        type: "rect",
        x: 50,
        y: 50,
        width: 200,
        height: 200,
      };
    case "circle":
      return {
        ...base,
        type: "circle",
        cx: 150,
        cy: 150,
        r: 80,
      };
    case "ellipse":
      return {
        ...base,
        type: "ellipse",
        cx: 150,
        cy: 150,
        rx: 100,
        ry: 60,
      };
    case "path":
      return {
        ...base,
        type: "path",
        path: "M 50 50 Q 100 20 150 50 Q 180 100 150 150 Q 100 180 50 150 Z",
      };
  }
}
