import style from "../styles/canvas.module.css";
import { useCanvas } from "../hooks/useCanvas";
import { ToolBar } from "./ToolBar";

export const Canvas = (props: any) => {
  const { draw, ...rest } = props;
  const {
    canvasRef,
    handlers,
    color,
    setColor,
    width,
    setWidth,
    tool,
    setTool,
    cursor,
    eraserWidth,
    setEraserWidth,
  } = useCanvas(draw);
  const isEraser = tool === "eraser" || tool === "line_eraser";

  return (
    <div>
      <ToolBar
        color={color}
        setColor={setColor}
        width={width}
        setWidth={setWidth}
        eraserWidth={eraserWidth}
        setEraserWidth={setEraserWidth}
        tool={tool}
        setTool={setTool}
      />
      <div className={style.wrapper}>
        <canvas
          className={isEraser ? style.canvas_eraser_mode : style.canvas}
          ref={canvasRef}
          {...rest}
          width={800}
          height={600}
          style={{ touchAction: "none" }}
          {...handlers}
        />
        {isEraser && cursor && (
          <div
            style={{
              position: "absolute",
              left: cursor.x - eraserWidth / 2,
              top: cursor.y - eraserWidth / 2,
              width: eraserWidth,
              height: eraserWidth,
              border: "1px solid #666",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
};
