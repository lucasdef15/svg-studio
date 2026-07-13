import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type WheelEvent,
} from "react";
import { useCanvas } from "../../hooks/useCanvasContext";
import { useContainerSize } from "../../hooks/useContainerSize";
import { useSpaceKey } from "../../hooks/useSpaceKey";
import { useSvgElement } from "../../hooks/useSvgElement";
import { ZOOM_WHEEL_SPEED } from "../../constants/canvas";
import type { Point } from "../../lib/geometry";
import { Rulers } from "./Rulers";
import { Grid } from "./Grid";
import { Crosshair } from "./Crosshair";
import { CoordinateDisplay } from "./CoordinateDisplay";
import { SelectionOverlay, type ResizeHandleId } from "./SelectionOverlay";

interface CanvasViewportProps {
  readonly children: ReactNode;
}

type InteractionMode = "idle" | "panning" | "dragging" | "resizing";

interface ResizeState {
  readonly handle: ResizeHandleId;
  readonly startCanvas: Point;
  readonly initial: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
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
    viewport,
    setViewport,
    showGrid,
    setShowGrid,
    mousePos,
    setMousePos,
    screenToCanvas,
    applySnap,
    clampZoom,
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
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);

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
    if (element.type !== "rect") return;

    setMode("resizing");
    setResizeState({
      handle,
      startCanvas: getCanvasPoint(event),
      initial: {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      },
    });
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
      x: applySnap(x),
      y: applySnap(y),
      width: applySnap(Math.max(width, 1)),
      height: applySnap(Math.max(height, 1)),
    });
  };
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
      applyRectResize(canvasPoint);
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
      ref={containerRef}
      className={`relative flex-1 min-h-0 w-full bg-slate-950 overflow-hidden border border-slate-800 rounded-lg shadow-2xl ${cursorClass}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Rulers containerSize={containerSize} />
      <CoordinateDisplay />

      <button
        type="button"
        onClick={() => setShowGrid((prev) => !prev)}
        className="absolute bottom-4 left-10 bg-slate-900/80 text-slate-300 px-3 py-1 rounded text-xs z-30 border border-slate-700 hover:bg-slate-800"
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
