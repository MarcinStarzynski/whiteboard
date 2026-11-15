export type Tool = "pen" | "eraser" | "line_eraser";

export type Stroke = {
  id: string;
  tool: Tool;
  points: Point[];
  color: string;
  width: number;
};

export type Point = {
  x: number;
  y: number;
};
