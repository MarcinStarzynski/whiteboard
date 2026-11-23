export type Key = string;
export type Modifier = string;

export interface Shortcut {
  key: Key;
  modifiers?: Modifier[];
}

export type ShortcutHandler = (e: KeyboardEvent) => void;

export interface ShortcutContextType {
  register: (shortcut: Shortcut, handler: ShortcutHandler) => void,
  unregister: (shortcut: Shortcut) => void
}

export type ShortcutRegistry = Map<string, ShortcutHandler>