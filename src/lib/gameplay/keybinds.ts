import { KeybindSettings, type KeybindName } from './settings/keybinds.svelte';
import hotkeys from 'hotkeys-js';

interface KeybindProps {
  onautoplaytoggle: () => void;
  ondensitydown: () => void;
  ondensityup: () => void;
  onfinedensitydown: () => void;
  onfinedensityup: () => void;
  onfineslowdown: () => void;
  onfinespeedup: () => void;
  onforward: () => void;
  onlongforward: () => void;
  onshortforward: () => void;
  onslowdown: () => void;
  onspeedup: () => void;
  onplaybacktoggle: () => void;
  onrestart: () => void;
  onrestartfromprevious: () => void;
  onrewind: () => void;
  onlongrewind: () => void;
  onshortrewind: () => void;
}

export function handleKeybinds({
  onautoplaytoggle,
  ondensitydown,
  ondensityup,
  onfinedensitydown,
  onfinedensityup,
  onfineslowdown,
  onfinespeedup,
  onforward,
  onlongforward,
  onshortforward,
  onslowdown,
  onspeedup,
  onplaybacktoggle,
  onrestart,
  onrestartfromprevious,
  onrewind,
  onlongrewind,
  onshortrewind,
}: KeybindProps) {
  // There may be a better way to type this out...
  bindKeybind('autoplayToggle', onautoplaytoggle);
  bindKeybind('densityDown', ondensitydown);
  bindKeybind('densityUp', ondensityup);
  bindKeybind('fineDensityDown', onfinedensitydown);
  bindKeybind('fineDensityUp', onfinedensityup);
  bindKeybind('fineSlowDown', onfineslowdown);
  bindKeybind('fineSpeedUp', onfinespeedup);
  bindKeybind('forward', onforward);
  bindKeybind('longForward', onlongforward);
  bindKeybind('shortForward', onshortforward);
  bindKeybind('slowDown', onslowdown);
  bindKeybind('speedUp', onspeedup);
  bindKeybind('playbackToggle', onplaybacktoggle);
  bindKeybind('restart', onrestart);
  bindKeybind('restartFromPrevious', onrestartfromprevious);
  bindKeybind('rewind', onrewind);
  bindKeybind('longRewind', onlongrewind);
  bindKeybind('shortRewind', onshortrewind);
}

function bindKeybind(keybindName: KeybindName, handler: () => void) {
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
