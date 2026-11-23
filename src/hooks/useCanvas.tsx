import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { Point, Stroke, Tool } from "../types/Stroke";
import { isNearStroke } from "../utils/geometry";
import useShortcuts from "./useShortcuts";

type DrawFn = (ctx: CanvasRenderingContext2D, strokes: Stroke[]) => void;

export const useCanvas = (draw: DrawFn) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [history, setHistory] = useState<Stroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(3);
  const [eraserWidth, setEraserWidth] = useState(20);
  const [tool, setTool] = useState<Tool>("pen");
  const [cursor, setCursor] = useState<Point | null>(null);
  const shortcuts = useShortcuts();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    draw(context, current ? [...strokes, current] : strokes);
  }, [strokes, current, draw]);

  const getPoint = (e: PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const eraseAt = (point: Point) => {
    const radius = eraserWidth / 2;
    setStrokes((prev) =>
      prev.filter((s, i) => {
        if (s.tool !== "pen") return true;
        if (!isNearStroke(point, s, radius)) return true;
        return prev
          .slice(i + 1)
          .some((e) => e.tool === "eraser" && isNearStroke(point, e, 0));
      }),
    );
  };

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = getPoint(e);
    if (tool === "line_eraser") {
      eraseAt(point);
      return;
    }
    setCurrent({
      id: crypto.randomUUID(),
      tool,
      points: [point],
      color,
      width: tool === "eraser" ? eraserWidth : width,
    });
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(e);
    setCursor(point);
    if (tool === "line_eraser") {
      if (e.buttons === 1) eraseAt(point);
      return;
    }
    setCurrent((c) => (c ? { ...c, points: [...c.points, point] } : c));
  };

  const onPointerUp = () => {
    if (!current) return;
    const newStrokes = [...strokes, current];
    setStrokes(newStrokes);
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newStrokes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setCurrent(null);
  };

  const undo = useCallback(() => {
    setHistoryIndex((prevIndex) => {
      if (prevIndex > 0) {
        const newIndex = prevIndex - 1;
        setStrokes(history[newIndex]);
        return newIndex;
      }
      return prevIndex;
    });
  }, [history]);

  useEffect(() => {
    shortcuts.register({ key: "z", modifiers: ["Ctrl"] }, undo);
    return () => shortcuts.unregister({ key: "z", modifiers: ["Ctrl"] });
  }, [undo, shortcuts]);

  const redo = useCallback(() => {
    setHistoryIndex((prevIndex) => {
      if (prevIndex < history.length - 1) {
        const newIndex = prevIndex + 1;
        setStrokes(history[newIndex]);
        return newIndex
      }
      return prevIndex
    });
  }, [history]);

  useEffect(() => {
    shortcuts.register({ key: "y", modifiers: ["Ctrl"]}, redo);
    return () => shortcuts.unregister({ key: "y", modifiers: ["Ctrl"] });
  }, [redo, shortcuts])

  useEffect(() => {
    shortcuts.register({ key: "z", modifiers: ["Ctrl", "Shift"]}, redo);
    return () => shortcuts.unregister({ key: "z", modifiers: ["Ctrl", "Shift"] });
  }, [redo, shortcuts])

  return {
    canvasRef,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
    color,
    setColor,
    width,
    setWidth,
    eraserWidth,
    setEraserWidth,
    tool,
    setTool,
    cursor,
  };
};
