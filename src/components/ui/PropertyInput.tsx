type PropertyInputProps = {
  label: string;
  type?: "text" | "number" | "color" | "textArea";
  value: string | number | undefined;
  id?: string;
  onChange: (value: string | number) => void;
};

export default function PropertyInput({
  label,
  type = "text",
  value,
  id,
  onChange,
}: PropertyInputProps) {
  const baseInputStyles =
    "w-full bg-panel-dark border border-border-dark rounded px-2.5 py-1.5 text-xs text-gray-200 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  if (type === "textArea") {
    return (
      <div className="flex flex-col gap-1.5 mb-3.5">
        <label
          htmlFor={id}
          className="text-[11px] font-medium text-text-muted capitalize tracking-wide"
        >
          {label}
        </label>
        <textarea
          id={id}
          value={value !== undefined ? String(value) : ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputStyles} min-h-16.25 resize-y`}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 mb-3.5">
      <label
        htmlFor={id}
        className="text-[11px] font-medium text-text-muted capitalize tracking-wide"
      >
        {label}
      </label>

      {type === "color" ? (
        <input
          id={id}
          type="color"
          value={value !== undefined ? String(value) : "#00000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 bg-panel-dark border border-border-dark rounded cursor-pointer"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value !== undefined ? String(value) : ""}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
          className={baseInputStyles}
        />
      )}
    </div>
  );
}
