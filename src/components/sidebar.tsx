import { useSvgElement } from "../hooks/useSvgElement";
import type { SvgElementType } from "../hooks/useSvgElement";
import PropertyInput from "./ui/PropertyInput";

const SHAPE_OPTIONS: ReadonlyArray<{
  readonly value: SvgElementType;
  readonly label: string;
}> = [
  { value: "path", label: "Path (Caminho)" },
  { value: "circle", label: "Circle (Círculo)" },
  { value: "rect", label: "Rect (Retângulo)" },
  { value: "ellipse", label: "Ellipse (Elipse)" },
];

function isSvgElementType(value: string): value is SvgElementType {
  return value === "path" || value === "circle" || value === "rect" || value === "ellipse";
}

export default function Sidebar() {
  const { element, updateField, setType } = useSvgElement();

  return (
    <aside className="w-72 h-full bg-panel-dark border-l border-border-dark p-4 flex flex-col gap-4 shadow-xl z-10 select-none shrink-0">
      <div className="border-b border-border-dark pb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Propriedades do Elemento
        </h2>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="svg_type"
            className="text-[11px] font-medium text-text-muted capitalize tracking-wide"
          >
            Tipo de Forma
          </label>
          <div className="relative">
            <select
              id="svg_type"
              value={element.type}
              onChange={(event) => {
                const value = event.target.value;
                if (isSvgElementType(value)) setType(value);
              }}
              className="w-full bg-panel-dark border border-border-dark rounded px-2.5 py-1.5 text-xs text-gray-200 outline-none cursor-pointer transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
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
            type="color"
            value={element.fill}
            label="Preenchimento"
            onChange={(value) => updateField("fill", String(value))}
          />
          <PropertyInput
            id="stroke"
            type="color"
            value={element.stroke}
            label="Contorno"
            onChange={(value) => updateField("stroke", String(value))}
          />
        </div>

        <PropertyInput
          id="strokeWidth"
          type="number"
          value={element.strokeWidth}
          label="Espessura do Contorno"
          onChange={(value) => updateField("strokeWidth", Number(value))}
        />

        {element.type === "path" && (
          <PropertyInput
            id="path"
            type="textArea"
            value={element.path}
            label="Dados do Caminho (d)"
            onChange={(value) => updateField("path", String(value))}
          />
        )}

        {element.type === "rect" && (
          <>
            <PropertyInput
              id="x"
              type="number"
              value={element.x}
              label="X"
              onChange={(value) => updateField("x", Number(value))}
            />
            <PropertyInput
              id="y"
              type="number"
              value={element.y}
              label="Y"
              onChange={(value) => updateField("y", Number(value))}
            />
            <PropertyInput
              id="width"
              type="number"
              value={element.width}
              label="Largura"
              onChange={(value) => updateField("width", Number(value))}
            />
            <PropertyInput
              id="height"
              type="number"
              value={element.height}
              label="Altura"
              onChange={(value) => updateField("height", Number(value))}
            />
          </>
        )}

        {(element.type === "circle" || element.type === "ellipse") && (
          <>
            <PropertyInput
              id="cx"
              type="number"
              value={element.cx}
              label="Centro X"
              onChange={(value) => updateField("cx", Number(value))}
            />
            <PropertyInput
              id="cy"
              type="number"
              value={element.cy}
              label="Centro Y"
              onChange={(value) => updateField("cy", Number(value))}
            />
          </>
        )}

        {element.type === "circle" && (
          <PropertyInput
            id="r"
            type="number"
            value={element.r}
            label="Raio"
            onChange={(value) => updateField("r", Number(value))}
          />
        )}

        {element.type === "ellipse" && (
          <>
            <PropertyInput
              id="rx"
              type="number"
              value={element.rx}
              label="Raio X"
              onChange={(value) => updateField("rx", Number(value))}
            />
            <PropertyInput
              id="ry"
              type="number"
              value={element.ry}
              label="Raio Y"
              onChange={(value) => updateField("ry", Number(value))}
            />
          </>
        )}
      </form>
    </aside>
  );
}
