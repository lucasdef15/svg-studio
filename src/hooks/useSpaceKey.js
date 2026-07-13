import { useEffect, useState } from "react";
export function useSpaceKey() {
    const [pressed, setPressed] = useState(false);
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.code === "Space") {
                event.preventDefault();
                setPressed(true);
            }
        };
        const onKeyUp = (event) => {
            if (event.code === "Space")
                setPressed(false);
        };
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, []);
    return pressed;
}
