import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { SvgElementProvider } from "./hooks/useSvgElement";
import "./index.css";
import App from "./App";
import { CanvasProvider } from "./hooks/useCanvasContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CanvasProvider>
      <SvgElementProvider>
        <App />
      </SvgElementProvider>
    </CanvasProvider>
  </StrictMode>,
);
