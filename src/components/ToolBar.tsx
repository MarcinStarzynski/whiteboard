import style from "../styles/toolBar.module.css";
import type { Tool } from "../types/Stroke";

interface ToolBarProps {
  color: string;
  setColor: (c: string) => void;
  width: number;
  setWidth: (w: number) => void;
  eraserWidth: number;
  setEraserWidth: (w: number) => void;
  tool: Tool;
  setTool: (t: Tool) => void;
  exportJpg: () => void;
}

export const ToolBar = ({
  color,
  setColor,
  width,
  setWidth,
  eraserWidth,
  setEraserWidth,
  tool,
  setTool,
  exportJpg
}: ToolBarProps) => {
  const isEraser = tool === "eraser" || tool === "line_eraser";
  const currentWidth = isEraser ? eraserWidth : width;
  const setCurrentWidth = isEraser ? setEraserWidth : setWidth;

  return (
    <div className={style.toolbar}>
      <button onClick={() => setTool("pen")} disabled={tool === "pen"}>
        Ołówek
      </button>
      <button
        onClick={() => setTool("line_eraser")}
        disabled={tool === "line_eraser"}
      >
        Usuń kreskę
      </button>
      <button onClick={() => setTool("eraser")} disabled={tool === "eraser"}>
        Gumka
      </button>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <input
        type="range"
        value={currentWidth}
        min={1}
        max={isEraser ? 60 : 25}
        onChange={(e) => setCurrentWidth(Number(e.target.value))}
      />
      <span>{currentWidth}px</span>
      <button onClick={() => exportJpg()}>Save image</button>
    </div>
  );
};
