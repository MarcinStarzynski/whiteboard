import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { Point, Stroke, Tool } from "../types/Stroke";
import { isNearStroke } from "../utils/geometry";

type DrawFn = (ctx: CanvasRenderingContext2D, strokes: Stroke[]) => void;

export const useCanvas = (draw: DrawFn) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(3);
  const [eraserWidth, setEraserWidth] = useState(20);
  const [tool, setTool] = useState<Tool>("pen");
  const [cursor, setCursor] = useState<Point | null>(null);

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
    setStrokes((prev) => [...prev, current]);
    setCurrent(null);
  };

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
