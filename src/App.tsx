import { Canvas } from "./components/Canvas";
import ShortcutProvider from "./contexts/ShortcutProvider";
import { draw } from "./utils/Draw";

function App() {
  return (
    <ShortcutProvider>
      <div>
        <Canvas draw={draw} />
      </div>
    </ShortcutProvider>
  );
}

export default App;
