/* eslint-disable import-x/no-unresolved */
import type { SvgElementType } from "../hooks/useSvgElement";

import { useSvgElement } from "../hooks/useSvgElement";
import PropertyInput from "./ui/PropertyInput";

const SHAPE_OPTIONS: readonly {
  readonly label: string;
  readonly value: SvgElementType;
}[] = [
  { label: "Path (Caminho)", value: "path" },
  { label: "Circle (Círculo)", value: "circle" },
  { label: "Rect (Retângulo)", value: "rect" },
  { label: "Ellipse (Elipse)", value: "ellipse" },
];

export default function Sidebar() {
  const { element, setType, updateField } = useSvgElement();

  return (
    <aside className="w-72 h-full bg-panel-dark border-l border-border-dark p-4 flex flex-col gap-4 shadow-xl z-10 select-none shrink-0">
      <div className="border-b border-border-dark pb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Propriedades do Elemento
        </h2>
      </div>

      <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[11px] font-medium text-text-muted capitalize tracking-wide"
            htmlFor="svg_type"
          >
            Tipo de Forma
          </label>
          <div className="relative">
            <select
              className="w-full bg-panel-dark border border-border-dark rounded px-2.5 py-1.5 text-xs text-gray-200 outline-none cursor-pointer transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
              id="svg_type"
              onChange={(event) => {
                const value = event.target.value;
                if (isSvgElementType(value)) setType(value);
              }}
              value={element.type}
            >
              {SHAPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-text-muted text-[10px]">
              ▼
            </div>
          </div>
        </div>

        <div className="border-b border-border-dark/50 my-1" />

        <div className="grid grid-cols-2 gap-3">
          <PropertyInput
            id="fill"
            label="Preenchimento"
            onChange={(value) => updateField("fill", String(value))}
            type="color"
            value={element.fill}
          />
          <PropertyInput
            id="stroke"
            label="Contorno"
            onChange={(value) => updateField("stroke", String(value))}
            type="color"
            value={element.stroke}
          />
        </div>

        <PropertyInput
          id="strokeWidth"
          label="Espessura do Contorno"
          onChange={(value) => updateField("strokeWidth", Number(value))}
          type="number"
          value={element.strokeWidth}
        />

        {element.type === "path" && (
          <PropertyInput
            id="path"
            label="Dados do Caminho (d)"
            onChange={(value) => updateField("path", String(value))}
            type="textArea"
            value={element.path}
          />
        )}

        {element.type === "rect" && (
          <>
            <PropertyInput
              id="x"
              label="X"
              onChange={(value) => updateField("x", Number(value))}
              type="number"
              value={element.x}
            />
            <PropertyInput
              id="y"
              label="Y"
              onChange={(value) => updateField("y", Number(value))}
              type="number"
              value={element.y}
            />
            <PropertyInput
              id="width"
              label="Largura"
              onChange={(value) => updateField("width", Number(value))}
              type="number"
              value={element.width}
            />
            <PropertyInput
              id="height"
              label="Altura"
              onChange={(value) => updateField("height", Number(value))}
              type="number"
              value={element.height}
            />
          </>
        )}

        {(element.type === "circle" || element.type === "ellipse") && (
          <>
            <PropertyInput
              id="cx"
              label="Centro X"
              onChange={(value) => updateField("cx", Number(value))}
              type="number"
              value={element.cx}
            />
            <PropertyInput
              id="cy"
              label="Centro Y"
              onChange={(value) => updateField("cy", Number(value))}
              type="number"
              value={element.cy}
            />
          </>
        )}

        {element.type === "circle" && (
          <PropertyInput
            id="r"
            label="Raio"
            onChange={(value) => updateField("r", Number(value))}
            type="number"
            value={element.r}
          />
        )}

        {element.type === "ellipse" && (
          <>
            <PropertyInput
              id="rx"
              label="Raio X"
              onChange={(value) => updateField("rx", Number(value))}
              type="number"
              value={element.rx}
            />
            <PropertyInput
              id="ry"
              label="Raio Y"
              onChange={(value) => updateField("ry", Number(value))}
              type="number"
              value={element.ry}
            />
          </>
        )}
      </form>
    </aside>
  );
}

function isSvgElementType(value: string): value is SvgElementType {
  return value === "path" || value === "circle" || value === "rect" || value === "ellipse";
}
