interface PropertyInputProps {
  id?: string;
  label: string;
  onChange: (value: number | string) => void;
  type?: "color" | "number" | "text" | "textArea";
  value: number | string | undefined;
}

export default function PropertyInput({
  id,
  label,
  onChange,
  type = "text",
  value,
}: PropertyInputProps) {
  const baseInputStyles =
    "w-full bg-panel-dark border border-border-dark rounded px-2.5 py-1.5 text-xs text-gray-200 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  if (type === "textArea") {
    return (
      <div className="flex flex-col gap-1.5 mb-3.5">
        <label
          className="text-[11px] font-medium text-text-muted capitalize tracking-wide"
          htmlFor={id}
        >
          {label}
        </label>
        <textarea
          className={`${baseInputStyles} min-h-16.25 resize-y`}
          id={id}
          onChange={(e) => onChange(e.target.value)}
          value={value !== undefined ? String(value) : ""}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 mb-3.5">
      <label
        className="text-[11px] font-medium text-text-muted capitalize tracking-wide"
        htmlFor={id}
      >
        {label}
      </label>

      {type === "color" ? (
        <input
          className="w-full h-9 bg-panel-dark border border-border-dark rounded cursor-pointer"
          id={id}
          onChange={(e) => onChange(e.target.value)}
          type="color"
          value={value !== undefined ? String(value) : "#00000"}
        />
      ) : (
        <input
          className={baseInputStyles}
          id={id}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
          type={type}
          value={value !== undefined ? String(value) : ""}
        />
      )}
    </div>
  );
}
