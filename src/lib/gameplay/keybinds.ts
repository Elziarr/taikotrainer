import type { ActionName, Actions } from './actions';
import { KeybindSettings } from './settings/keybinds.svelte';
import hotkeys from 'hotkeys-js';

export function bindKeybinds(actions: Actions) {
  for (const [name, callback] of Object.entries(actions)) {
    bindKeybind(name as ActionName, callback);
  }
}

function bindKeybind(keybindName: ActionName, handler: () => void) {
  const handlerWrappper = () => {
    if (KeybindSettings.keybindSetPending) {
      return;
    }

    handler();
  };

  hotkeys(KeybindSettings.getKeybind(keybindName), handlerWrappper);

  KeybindSettings.onKeybindChange(
    keybindName,
    (currKeybind: string, prevKeybind: string) => {
      hotkeys.unbind(prevKeybind);
      hotkeys(currKeybind, handlerWrappper);
    },
  );
}
