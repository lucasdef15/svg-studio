import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable import-x/no-unresolved */
import { useSvgElement } from "../hooks/useSvgElement";
import { CanvasViewport } from "./canvas/CanvasViewport";
import { SvgShape } from "./SvgShape";
export default function PathEditor() {
    const { element } = useSvgElement();
    return (_jsxs("main", { className: "flex-1 flex flex-col min-h-0 min-w-0 p-4", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(#2c313c_1px,transparent_1px)] [bg-size:16px_16px] opacity-40 pointer-events-none" }), _jsx("div", { className: "relative flex flex-col flex-1 min-h-0 bg-[#181a1f] p-4 rounded-xl border border-border-dark shadow-2xl", children: _jsx(CanvasViewport, { children: _jsx(SvgShape, { element: element }) }) })] }));
}
