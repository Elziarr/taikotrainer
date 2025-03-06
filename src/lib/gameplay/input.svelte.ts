export type GameInputType = 'left_ka' | 'left_don' | 'right_don' | 'right_ka';

export interface GameInput {
  type: GameInputType;
  time: number;
}

interface GameInputProps {
  startTime: number;
  ongameinput: (input: GameInput) => void;
}

// TODO: Handle custom keybinds
export function gameInput(
  node: HTMLElement,
  { startTime, ongameinput }: GameInputProps,
) {
  let leftKaDown = false;
  let leftDonDown = false;
  let rightDonDown = false;
  let rightKaDown = false;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'd' && !leftKaDown) {
      ongameinput({ type: 'left_ka', time: e.timeStamp - startTime });
      leftKaDown = true;
    }
    if (e.key === 'f' && !leftDonDown) {
      ongameinput({ type: 'left_don', time: e.timeStamp - startTime });
      leftDonDown = true;
    }

    if (e.key === 'j' && !rightDonDown) {
      ongameinput({ type: 'right_don', time: e.timeStamp - startTime });
      rightDonDown = true;
    }

    if (e.key === 'k' && !rightKaDown) {
      ongameinput({ type: 'right_ka', time: e.timeStamp - startTime });
      rightKaDown = true;
    }
  }

  function handleKeyup(e: KeyboardEvent) {
    if (e.key === 'd' && leftKaDown) {
      leftKaDown = false;
    }

    if (e.key === 'f' && leftDonDown) {
      leftDonDown = false;
    }

    if (e.key === 'j' && rightDonDown) {
      rightDonDown = false;
    }

    if (e.key === 'k' && rightKaDown) {
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
