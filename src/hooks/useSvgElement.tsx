import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { createDefaultElement } from "../lib/element-defaults";

export type SvgElementType = "path" | "circle" | "rect" | "ellipse";

type SvgElementProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  r: number;
  rx: number;
  ry: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  path: string;
};

export type BaseSvgElement = {
  readonly type: SvgElementType;
  readonly fill: string;
  readonly stroke: string;
  readonly strokeWidth: number;
};

export type PathElement = BaseSvgElement & {
  readonly type: "path";
  readonly path: string;
};

export type CircleElement = BaseSvgElement & {
  readonly type: "circle";
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
};

export type EllipseElement = BaseSvgElement & {
  readonly type: "ellipse";
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
};

export type RectElement = BaseSvgElement & {
  readonly type: "rect";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type SvgElement = PathElement | CircleElement | EllipseElement | RectElement;

type ElementPatch = Partial<Omit<SvgElement, "type"> & Record<string, string | number>>;

interface SvgElementContextValue {
  readonly element: SvgElement;
  readonly setElement: Dispatch<SetStateAction<SvgElement>>;
}

const SvgElementContext = createContext<SvgElementContextValue | undefined>(undefined);

export function SvgElementProvider({ children }: { children: ReactNode }) {
  const [element, setElement] = useState<SvgElement>(() => createDefaultElement("rect"));

  const value = useMemo(() => ({ element, setElement }), [element]);

  return <SvgElementContext.Provider value={value}>{children}</SvgElementContext.Provider>;
}

export function useSvgElement() {
  const context = useContext(SvgElementContext);

  if (!context) {
    throw new Error("useSvgElement must be used within SvgElementProvider");
  }

  const { element, setElement } = context;

  const setType = useCallback(
    (newType: SvgElementType) => {
      setElement(
        createDefaultElement(newType, {
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
        }),
      );
    },
    [element.fill, element.stroke, element.strokeWidth, setElement],
  );

  const patch = useCallback(
    (updates: ElementPatch) => {
      setElement((prev) => ({ ...prev, ...updates }) as SvgElement);
    },
    [setElement],
  );

  const updateField = <k extends keyof SvgElementProps>(key: k, value: SvgElementProps[k]) => {
    setElement((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    element,
    setElement,
    setType,
    patch,
    updateField,
  };
}
