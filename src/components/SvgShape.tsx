import type { SvgElement } from "../hooks/useSvgElement";

interface SvgShapeProps {
  readonly element: SvgElement;
}

export function SvgShape({ element }: SvgShapeProps) {
  const { fill, stroke, strokeWidth } = element;

  switch (element.type) {
    case "circle":
      return (
        <circle
          cx={element.cx}
          cy={element.cy}
          fill={fill}
          r={element.r}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case "ellipse":
      return (
        <ellipse
          cx={element.cx}
          cy={element.cy}
          fill={fill}
          rx={element.rx}
          ry={element.ry}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case "path":
      return <path d={element.path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    case "rect":
      return (
        <rect
          fill={fill}
          height={element.height}
          stroke={stroke}
          strokeWidth={strokeWidth}
          width={element.width}
          x={element.x}
          y={element.y}
        />
      );
  }
}
