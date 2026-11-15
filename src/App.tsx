import { Canvas } from "./components/Canvas";
import { draw } from "./utils/Draw";

function App() {
  return (
    <div>
      Nie rysuj kutasów
      <Canvas draw={draw} />
    </div>
  );
}

export default App;
