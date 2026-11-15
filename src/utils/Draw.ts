import type { Stroke } from "../types/Stroke";

const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
  if (stroke.points.length === 0) return;

  ctx.save();
  ctx.lineWidth = stroke.width;

  if (stroke.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = stroke.color;
  }

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (const point of stroke.points) ctx.lineTo(point.x, point.y);
  ctx.stroke();
  ctx.restore();
};

export const draw = (ctx: CanvasRenderingContext2D, strokes: Stroke[]) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const stroke of strokes) drawStroke(ctx, stroke);
};
