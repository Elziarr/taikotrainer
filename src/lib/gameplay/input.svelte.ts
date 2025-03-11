import { GameplaySettings } from './settings/gameplay.svelte';
import { KeybindSettings } from './settings/keybinds.svelte';

export type GameInputType = 'left_ka' | 'left_don' | 'right_don' | 'right_ka';

export interface GameInput {
  type: GameInputType;
  time: number;
}

interface GameInputProps {
  getStartTimestamp: () => number;
  ongameinput: (input: GameInput) => void;
}

// TODO: Handle custom keybinds
export function gameInput(
  node: HTMLElement,
  { getStartTimestamp, ongameinput }: GameInputProps,
) {
  let leftKaDown = false;
  let leftDonDown = false;
  let rightDonDown = false;
  let rightKaDown = false;

  function getInputTime(evtTimestamp: number) {
    return (
      evtTimestamp -
      getStartTimestamp() +
      // Howler.ctx.baseLatency +
      GameplaySettings.offset
    );
  }

  function handleKeydown(e: KeyboardEvent) {
    if (KeybindSettings.keybindSetPending) {
      return;
    }

    if (e.key === KeybindSettings.getKeybind('leftKa') && !leftKaDown) {
      ongameinput({ type: 'left_ka', time: getInputTime(e.timeStamp) });
      leftKaDown = true;
    }

    if (e.key === KeybindSettings.getKeybind('leftDon') && !leftDonDown) {
      ongameinput({
        type: 'left_don',
        time: getInputTime(e.timeStamp),
      });
      leftDonDown = true;
    }

    if (e.key === KeybindSettings.getKeybind('rightDon') && !rightDonDown) {
      ongameinput({
        type: 'right_don',
        time: getInputTime(e.timeStamp),
      });
      rightDonDown = true;
    }

    if (e.key === KeybindSettings.getKeybind('rightKa') && !rightKaDown) {
      ongameinput({
        type: 'right_ka',
        time: getInputTime(e.timeStamp),
      });
      rightKaDown = true;
    }
  }

  function handleKeyup(e: KeyboardEvent) {
    if (e.key === KeybindSettings.getKeybind('leftKa') && leftKaDown) {
      leftKaDown = false;
    }

    if (e.key === KeybindSettings.getKeybind('leftDon') && leftDonDown) {
      leftDonDown = false;
    }

    if (e.key === KeybindSettings.getKeybind('rightDon') && rightDonDown) {
      rightDonDown = false;
    }

    if (e.key === KeybindSettings.getKeybind('rightKa') && rightKaDown) {
      rightKaDown = false;
    }
  }

  $effect(() => {
    node.addEventListener('keydown', handleKeydown);
    node.addEventListener('keyup', handleKeyup);

    return () => {
      node.removeEventListener('keydown', handleKeydown);
      node.removeEventListener('keyup', handleKeyup);
    };
  });
}
