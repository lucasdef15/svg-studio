import type { SvgElement } from "../hooks/useSvgElement";

interface SvgShapeProps {
  readonly element: SvgElement;
}

export function SvgShape({ element }: SvgShapeProps) {
  const { fill, stroke, strokeWidth } = element;

  switch (element.type) {
    case "path":
      return <path d={element.path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    case "circle":
      return (
        <circle
          cx={element.cx}
          cy={element.cy}
          r={element.r}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case "rect":
      return (
        <rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case "ellipse":
      return (
        <ellipse
          cx={element.cx}
          cy={element.cy}
          rx={element.rx}
          ry={element.ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
  }
}
