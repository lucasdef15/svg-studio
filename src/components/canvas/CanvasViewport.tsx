/* eslint-disable import-x/no-unresolved */
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react";

import type { Point } from "../../lib/geometry";

import { ZOOM_WHEEL_SPEED } from "../../constants/canvas";
import { useCanvas } from "../../hooks/useCanvasContext";
import { useContainerSize } from "../../hooks/useContainerSize";
import { useSpaceKey } from "../../hooks/useSpaceKey";
import {
  type CircleElement,
  type EllipseElement,
  type RectElement,
  useSvgElement,
} from "../../hooks/useSvgElement";
import { CoordinateDisplay } from "./CoordinateDisplay";
import { Crosshair } from "./Crosshair";
import { Grid } from "./Grid";
import { Rulers } from "./Rulers";
import { type ResizeHandleId, SelectionOverlay } from "./SelectionOverlay";

interface CanvasViewportProps {
  readonly children: ReactNode;
}

type CircleResizeInitial = Pick<CircleElement, "cx" | "cy" | "r">;
type EllipseResizeInitial = Pick<EllipseElement, "cx" | "cy" | "rx" | "ry">;
type InteractionMode = "dragging" | "idle" | "panning" | "resizing";

type ResizeInitial = Pick<RectElement, "height" | "width" | "x" | "y">;

interface ResizeState {
  readonly handle: ResizeHandleId;
  readonly initial: CircleResizeInitial | EllipseResizeInitial | ResizeInitial;
  readonly startCanvas: Point;
}

export function CanvasViewport({ children }: CanvasViewportProps) {
  /**
   * ============================================================================
   * REFERÊNCIAS E HOOKS
   * ============================================================================
   *
   *
   * - referência para o container
   * - tamanho disponível
   * - tecla Espaço
   * - estado global do Canvas
   * - elemento atualmente selecionado
   */
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useContainerSize(containerRef);
  const spacePressed = useSpaceKey();

  /**
   * ============================================================================
   * BLOQUEIA O ZOOM DO NAVEGADOR
   * ============================================================================
   *
   * Ctrl + Scroll normalmente faz zoom na página.
   *
   * Como estamos criando um editor gráfico,
   * queremos usar esse gesto para controlar
   * apenas o Canvas.
   *
   * Por isso registramos um listener nativo
   * com passive: false.
   */
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const preventBrowserZoom = (event: Event) => {
      const wheelEvent = event as globalThis.WheelEvent;
      if (wheelEvent.ctrlKey || wheelEvent.metaKey) {
        event.preventDefault();
      }
    };

    element.addEventListener("wheel", preventBrowserZoom, {
      passive: false,
    });

    return () => {
      element.removeEventListener("wheel", preventBrowserZoom);
    };
  }, []);

  const {
    applySnap,
    clampZoom,
    screenToCanvas,
    // mousePos,
    setMousePos,
    setShowGrid,
    setViewport,
    showGrid,
    viewport,
  } = useCanvas();

  const { element, patch } = useSvgElement();

  /**
   * ============================================================================
   * ESTADO DA INTERAÇÃO
   * ============================================================================
   *
   * mode
   * ----------
   * Define o que o usuário está fazendo neste momento.
   *
   * idle
   * panning
   * dragging
   * resizing
   *
   * dragAnchor
   * ----------
   * Guarda o ponto inicial de um arraste.
   *
   * resizeState
   * ----------
   * Guarda todas as informações necessárias
   * para calcular um Resize.
   */
  const [mode, setMode] = useState<InteractionMode>("idle");
  const [dragAnchor, setDragAnchor] = useState<Point>({ x: 0, y: 0 });
  const [resizeState, setResizeState] = useState<null | ResizeState>(null);

  /**
   * ============================================================================
   * CONVERTE COORDENADAS
   * ============================================================================
   *
   * O mouse trabalha em Screen Space.
   *
   * Os elementos SVG vivem em Canvas Space.
   *
   * Esta função converte uma coordenada
   * da tela para coordenadas do Canvas.
   */
  const getCanvasPoint = (event: MouseEvent): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return screenToCanvas(event.clientX, event.clientY, rect);
  };

  /**
   * ============================================================================
   * CONTROLA A NAVEGAÇÃO PELO MOUSE
   * ============================================================================
   *
   * Ctrl + Scroll
   *      Zoom
   *
   * Shift + Scroll
   *      Pan Horizontal
   *
   * Scroll
   *      Pan Vertical
   */
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    // Ctrl + Scroll = Zoom
    //ele aumenta ou diminui o zoom da tela, empurrando o cenário para os lados de forma que o seu cursor funcione como o "centro" do zoom.
    if (event.ctrlKey || event.metaKey) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const delta = -event.deltaY;
      const newZoom = clampZoom(viewport.zoom + delta * ZOOM_WHEEL_SPEED);

      setViewport({
        x: mouseX - (mouseX - viewport.x) * (newZoom / viewport.zoom),
        y: mouseY - (mouseY - viewport.y) * (newZoom / viewport.zoom),
        zoom: newZoom,
      });

      return;
    }

    // Shift + Scroll = Pan horizontal
    if (event.shiftKey) {
      setViewport((prev) => ({
        ...prev,
        x: prev.x - event.deltaY,
      }));

      return;
    }

    // Scroll normal = Pan vertical
    setViewport((prev) => ({
      ...prev,
      y: prev.y - event.deltaY,
    }));
  };
  /**
   * ============================================================================
   * INICIA UMA INTERAÇÃO
   * ============================================================================
   *
   * Quando o usuário pressiona o botão do mouse,
   * decidimos qual operação será iniciada.
   *
   * Espaço pressionado
   *      → Pan
   *
   * Caso contrário
   *      → Drag do elemento.
   */
  const handleMouseDown = (event: MouseEvent) => {
    if (spacePressed) {
      setMode("panning");
      setDragAnchor({
        x: event.clientX - viewport.x,
        y: event.clientY - viewport.y,
      });
      return;
    }

    setMode("dragging");
    setDragAnchor(getCanvasPoint(event));
  };
  /**
   * ============================================================================
   * INICIA O REDIMENSIONAMENTO
   * ============================================================================
   *
   * Chamado quando o usuário pressiona
   * um dos Handles da seleção.
   *
   * Neste momento salvamos:
   *
   * - Handle utilizado
   * - posição inicial
   * - dimensões iniciais
   *
   * Essas informações serão usadas durante
   * o MouseMove para calcular o novo tamanho.
   */
  const handleResizeStart = (handle: ResizeHandleId, event: MouseEvent<SVGRectElement>) => {
    if (element.type === "rect") {
      setResizeState({
        handle,
        initial: {
          height: element.height,
          width: element.width,
          x: element.x,
          y: element.y,
        },
        startCanvas: getCanvasPoint(event),
      });
    }

    if (element.type === "circle") {
      setResizeState({
        handle,
        initial: {
          cx: element.cx,
          cy: element.cy,
          r: element.r,
        },
        startCanvas: getCanvasPoint(event),
      });
    }

    if (element.type === "ellipse") {
      setResizeState({
        handle,
        initial: {
          cx: element.cx,
          cy: element.cy,
          rx: element.rx,
          ry: element.ry,
        },
        startCanvas: getCanvasPoint(event),
      });
    }

    setMode("resizing");
  };
  /**
   * ============================================================================
   * REDIMENSIONA UM RECT
   * ============================================================================
   *
   * Calcula o novo tamanho do retângulo
   * de acordo com o Handle que está sendo
   * arrastado.
   *
   * Exemplo:
   *
   * NE
   *      aumenta Width
   *      diminui Height
   *
   * SW
   *      diminui Width
   *      aumenta Height
   *
   * Após calcular,
   * aplica Snap e atualiza o elemento.
   */
  const applyRectResize = (current: Point) => {
    if (!resizeState) return;

    const dx = current.x - resizeState.startCanvas.x;
    const dy = current.y - resizeState.startCanvas.y;
    const { handle, initial } = resizeState;

    if (!("width" in initial) || !("height" in initial)) return;

    let x = initial.x;
    let y = initial.y;
    let width = initial.width;
    let height = initial.height;

    if (handle.includes("e")) width = initial.width + dx;
    if (handle.includes("s")) height = initial.height + dy;
    if (handle.includes("w")) {
      x = initial.x + dx;
      width = initial.width - dx;
    }
    if (handle.includes("n")) {
      y = initial.y + dy;
      height = initial.height - dy;
    }

    patch({
      height: applySnap(Math.max(height, 1)),
      width: applySnap(Math.max(width, 1)),
      x: applySnap(x),
      y: applySnap(y),
    });
  };
  const applyCircleResize = (current: Point) => {
    if (!resizeState) return;

    const dx = current.x - resizeState.startCanvas.x;
    const dy = current.y - resizeState.startCanvas.y;
    const { handle, initial } = resizeState;

    if (!("r" in initial)) return;

    let radius = initial.r;

    if (handle.includes("e")) radius = initial.r + dx;
    if (handle.includes("w")) radius = initial.r - dx;

    if (handle.includes("s")) radius = Math.max(radius, initial.r + dy);
    if (handle.includes("n")) radius = Math.max(radius, initial.r - dy);

    patch({
      r: applySnap(Math.max(radius, 1)),
    });
  };
  function applyEllipseResize(current: Point) {
    if (!resizeState) return;
    if (element.type !== "ellipse") return;

    const dx = current.x - resizeState.startCanvas.x;
    const dy = current.y - resizeState.startCanvas.y;

    if (!("rx" in resizeState.initial) || !("ry" in resizeState.initial)) return;

    let rx = resizeState.initial.rx;
    let ry = resizeState.initial.ry;

    if (resizeState.handle.includes("e")) {
      rx += dx;
    }

    if (resizeState.handle.includes("w")) {
      rx -= dx;
    }

    if (resizeState.handle.includes("s")) {
      ry += dy;
    }

    if (resizeState.handle.includes("n")) {
      ry -= dy;
    }

    patch({
      rx: applySnap(Math.max(rx, 1)),
      ry: applySnap(Math.max(ry, 1)),
    });
  }
  /**
   * ============================================================================
   * MOVE O ELEMENTO
   * ============================================================================
   *
   * Calcula quanto o mouse caminhou desde
   * o último frame (dx e dy)
   * e desloca o elemento.
   *
   * Atualmente suporta:
   *
   * - Rect
   * - Circle
   * - Ellipse
   */
  const applyElementDrag = (current: Point) => {
    const dx = current.x - dragAnchor.x;
    const dy = current.y - dragAnchor.y;

    if (element.type === "rect") {
      patch({
        x: applySnap(element.x + dx),
        y: applySnap(element.y + dy),
      });
    } else if (element.type === "circle" || element.type === "ellipse") {
      patch({
        cx: applySnap(element.cx + dx),
        cy: applySnap(element.cy + dy),
      });
    }

    setDragAnchor(current);
  };
  /**
   * ============================================================================
   * LOOP PRINCIPAL DA INTERAÇÃO
   * ============================================================================
   *
   * Esta função é executada toda vez que
   * o mouse se move.
   *
   * Primeiro atualiza a posição do cursor.
   *
   * Depois executa apenas a operação
   * correspondente ao modo atual.
   *
   * Panning
   *      move a câmera
   *
   * Dragging
   *      move o elemento
   *
   * Resizing
   *      redimensiona o elemento
   */
  const handleMouseMove = (event: MouseEvent) => {
    const canvasPoint = getCanvasPoint(event);
    setMousePos({
      x: Math.round(canvasPoint.x),
      y: Math.round(canvasPoint.y),
    });

    if (mode === "panning") {
      setViewport((prev) => ({
        ...prev,
        x: event.clientX - dragAnchor.x,
        y: event.clientY - dragAnchor.y,
      }));
      return;
    }

    if (mode === "resizing") {
      switch (element.type) {
        case "circle":
          applyCircleResize(canvasPoint);
          break;

        case "ellipse":
          applyEllipseResize(canvasPoint);
          break;

        case "rect":
          applyRectResize(canvasPoint);
          break;
      }

      return;
    }

    if (mode === "dragging") {
      applyElementDrag(canvasPoint);
    }
  };
  /**
   * ============================================================================
   * FINALIZA A INTERAÇÃO
   * ============================================================================
   *
   * Independentemente da operação em andamento,
   * o editor volta ao estado Idle.
   */
  const handleMouseUp = () => {
    setMode("idle");
    setResizeState(null);
  };

  /**
   * ============================================================================
   * CURSOR DO MOUSE
   * ============================================================================
   *
   * O cursor muda dinamicamente para indicar
   * ao usuário qual operação pode ser realizada.
   */
  const cursorClass = spacePressed
    ? "cursor-grab active:cursor-grabbing"
    : mode === "dragging" || mode === "resizing"
      ? "cursor-move"
      : "cursor-crosshair";

  /**
   * ============================================================================
   * RENDERIZAÇÃO
   * ============================================================================
   *
   * Estrutura visual do editor.
   *
   * Rulers
   * CoordinateDisplay
   * Grid
   * Crosshair
   * SVG do usuário
   * SelectionOverlay
   */
  return (
    <div
      className={`relative flex-1 min-h-0 w-full bg-slate-950 overflow-hidden border border-slate-800 rounded-lg shadow-2xl ${cursorClass}`}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      ref={containerRef}
    >
      <Rulers containerSize={containerSize} />
      <CoordinateDisplay />

      <button
        className="absolute bottom-4 left-10 bg-slate-900/80 text-slate-300 px-3 py-1 rounded text-xs z-30 border border-slate-700 hover:bg-slate-800"
        onClick={() => setShowGrid((prev) => !prev)}
        type="button"
      >
        Grid: {showGrid ? "ON" : "OFF"}
      </button>

      <svg className="w-full h-full">
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
          <Grid containerSize={containerSize} />
          <Crosshair containerSize={containerSize} />
          {children}
          <SelectionOverlay element={element} onResizeStart={handleResizeStart} />
        </g>
      </svg>
    </div>
  );
}
