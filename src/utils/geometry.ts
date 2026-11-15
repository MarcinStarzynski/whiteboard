import type { Point, Stroke } from "../types/Stroke";

const distToSegment = (point: Point, a: Point, b: Point) => {
  const distanceX = b.x - a.x;
  const distanceY = b.y - a.y;
  const lenSq = distanceX * distanceX + distanceY * distanceY;
  let t =
    lenSq === 0
      ? 0
      : ((point.x - a.x) * distanceX + (point.y - a.y) * distanceY) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(
    point.x - (a.x + t * distanceX),
    point.y - (a.y + t * distanceY),
  );
};

export const isNearStroke = (point: Point, stroke: Stroke, radius: number) => {
  if (stroke.points.length === 1) {
    return (
      Math.hypot(point.x - stroke.points[0].x, point.y - stroke.points[0].y) <=
      radius + stroke.width / 2
    );
  }
  for (let i = 1; i < stroke.points.length; i++) {
    if (
      distToSegment(point, stroke.points[i - 1], stroke.points[i]) <=
      radius + stroke.width / 2
    )
      return true;
  }
  return false;
};
