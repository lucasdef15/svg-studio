import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable import-x/no-unresolved */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { CanvasProvider } from "./hooks/useCanvasContext";
import { SvgElementProvider } from "./hooks/useSvgElement";
const container = document.getElementById("root");
if (!container)
    throw new Error("Root element not found");
createRoot(container).render(_jsx(StrictMode, { children: _jsx(CanvasProvider, { children: _jsx(SvgElementProvider, { children: _jsx(App, {}) }) }) }));
