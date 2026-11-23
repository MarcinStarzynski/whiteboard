import { createContext } from "react";
import type { ShortcutContextType } from "../types/ShortcutProvider";

export const ShortcutContext = createContext<ShortcutContextType>({
  register: () => {},
  unregister: () => {},
})