import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { Point, Stroke, Tool } from "../types/Stroke";
import { isNearStroke } from "../utils/geometry";
import useShortcuts from "./useShortcuts";
import { exportCanvasAsJpg } from "../utils/exportJpg";

type DrawFn = (ctx: CanvasRenderingContext2D, strokes: Stroke[]) => void;

export const useCanvas = (draw: DrawFn) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(3);
  const [eraserWidth, setEraserWidth] = useState(20);
  const [tool, setTool] = useState<Tool>("pen");
  const [cursor, setCursor] = useState<Point | null>(null);
  const shortcuts = useShortcuts();
  
  const historyRef = useRef<Stroke[][]>([[]]);

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

  const addToHistory = useCallback((newStrokes: Stroke[]) => {
    historyRef.current = historyRef.current.slice(0, historyIndex + 1);
    historyRef.current.push(newStrokes);
    setHistoryIndex(historyRef.current.length - 1);
  }, [historyIndex]);

  const eraseAt = useCallback((point: Point) => {
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
  }, [eraserWidth]);

  const onPointerDown = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
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
  }, [tool, eraserWidth, width, color, eraseAt]);

  const onPointerMove = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(e);
    setCursor(point);
    if (tool === "line_eraser") {
      if (e.buttons === 1) eraseAt(point);
      return;
    }
    setCurrent((c) => (c ? { ...c, points: [...c.points, point] } : c));
  }, [tool, eraseAt]);

  const onPointerUp = useCallback(() => {
    setCurrent((c) => {
      if (!c) return null;
      setStrokes((prev) => {
        const newStrokes = [...prev, c];
        addToHistory(newStrokes);
        return newStrokes;
      });
      return null;
    });
  }, [addToHistory]);

  const undo = useCallback(() => {
    setHistoryIndex((prevIndex) => {
      const newIndex = Math.max(0, prevIndex - 1);
      setStrokes(historyRef.current[newIndex]);
      return newIndex;
    });
  }, []);

  const redo = useCallback(() => {
    setHistoryIndex((prevIndex) => {
      const newIndex = Math.min(prevIndex + 1, historyRef.current.length - 1);
      setStrokes(historyRef.current[newIndex]);
      return newIndex;
    });
  }, []);

  const exportJpg = useCallback(() => {
    if(canvasRef.current) {
      exportCanvasAsJpg(canvasRef.current);
    }
  }, [])

  useEffect(() => {
    shortcuts.register({ key: "z", modifiers: ["Ctrl"] }, undo);
    shortcuts.register({ key: "z", modifiers: ["Meta"] }, undo);
    shortcuts.register({ key: "y", modifiers: ["Ctrl"] }, redo);
    shortcuts.register({ key: "y", modifiers: ["Meta"] }, redo);
    shortcuts.register({ key: "z", modifiers: ["Ctrl", "Shift"] }, redo);
    shortcuts.register({ key: "z", modifiers: ["Meta", "Shift"] }, redo);
    
    return () => {
      shortcuts.unregister({ key: "z", modifiers: ["Ctrl"] });
      shortcuts.unregister({ key: "z", modifiers: ["Meta"] });
      shortcuts.unregister({ key: "y", modifiers: ["Ctrl"] });
      shortcuts.unregister({ key: "y", modifiers: ["Meta"] });
      shortcuts.unregister({ key: "z", modifiers: ["Ctrl", "Shift"] });
      shortcuts.unregister({ key: "z", modifiers: ["Meta", "Shift"] });
    };
  }, [undo, redo, shortcuts]);

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
    exportJpg
  };
};
