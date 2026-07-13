import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useState, } from "react";
import { createDefaultElement } from "../lib/element-defaults";
const SvgElementContext = createContext(undefined);
export function SvgElementProvider({ children }) {
    const [element, setElement] = useState(() => createDefaultElement("rect"));
    const value = useMemo(() => ({ element, setElement }), [element]);
    return _jsx(SvgElementContext.Provider, { value: value, children: children });
}
export function useSvgElement() {
    const context = useContext(SvgElementContext);
    if (!context) {
        throw new Error("useSvgElement must be used within SvgElementProvider");
    }
    const { element, setElement } = context;
    const setType = useCallback((newType) => {
        setElement(createDefaultElement(newType, {
            fill: element.fill,
            stroke: element.stroke,
            strokeWidth: element.strokeWidth,
        }));
    }, [element.fill, element.stroke, element.strokeWidth, setElement]);
    const patch = useCallback((updates) => {
        setElement((prev) => ({ ...prev, ...updates }));
    }, [setElement]);
    const updateField = (key, value) => {
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
