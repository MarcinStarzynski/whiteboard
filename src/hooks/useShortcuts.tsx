import { useContext } from "react";
import { ShortcutContext } from "../contexts/ShortcutContext";

const useShortcuts = () => {
  const shortcutContext = useContext(ShortcutContext);

  if(!shortcutContext) {
    console.error("Shortcut context must be wrapped inside Shortcut provider");
  }

  return shortcutContext;
}

export default useShortcuts;