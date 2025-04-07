import type { Timeline } from './AudioTimeline.svelte';
import type { GameplaySettings } from './settings/gameplay.svelte';

export type Actions = ReturnType<typeof initActions>;
export type ActionName = keyof Actions;

interface InitActionsParams {
  checkpointTime: {
    get(): number | null;
    set(time: number | null): void;
  };
  gameplaySettings: GameplaySettings;
  timeline: Timeline;
}

const COARSE_ADJUSTMENT = 0.1;
const FINE_ADJUSTMENT = 0.05;
const LONG_JUMP = 2.5;
const MIN_DENSITY_MULTIPLIER = 0.1;
const MIN_SPEED_MULTIPLIER = 0.1;
const SHORT_JUMP = 0.4;

export function initActions({
  checkpointTime,
  gameplaySettings,
  timeline,
}: InitActionsParams) {
  return {
    clearCheckpointTime() {
      checkpointTime.set(null);
    },

    decreaseDensity() {
      gameplaySettings.densityMultiplier = Math.max(
        MIN_DENSITY_MULTIPLIER,
        gameplaySettings.densityMultiplier - COARSE_ADJUSTMENT,
      );
    },

    decreaseSpeed() {
      gameplaySettings.speedMultiplier = Math.max(
        MIN_SPEED_MULTIPLIER,
        gameplaySettings.speedMultiplier - COARSE_ADJUSTMENT,
      );
    },

    fineDecreaseDensity() {
      gameplaySettings.densityMultiplier = Math.max(
        FINE_ADJUSTMENT,
        gameplaySettings.densityMultiplier - FINE_ADJUSTMENT,
      );
    },

    fineDecreaseSpeed() {
      gameplaySettings.speedMultiplier = Math.max(
        FINE_ADJUSTMENT,
        gameplaySettings.speedMultiplier - FINE_ADJUSTMENT,
      );
    },

    fineIncreaseDensity() {
      gameplaySettings.densityMultiplier += FINE_ADJUSTMENT;
    },

    fineIncreaseSpeed() {
      gameplaySettings.speedMultiplier += FINE_ADJUSTMENT;
    },

    forward() {
      timeline.forward();
    },

    increaseDensity() {
      gameplaySettings.densityMultiplier += COARSE_ADJUSTMENT;
    },

    increaseSpeed() {
      gameplaySettings.speedMultiplier += COARSE_ADJUSTMENT;
    },

    longForward() {
      timeline.forward(LONG_JUMP);
    },

    longRewind() {
      timeline.rewind(LONG_JUMP);
    },

    restart() {
      timeline.restart();
    },

    restartFromPrevious() {
      timeline.seek(checkpointTime.get() ?? timeline.startTime);
    },

    rewind() {
      timeline.rewind();
    },

    setCheckpointTime() {
      checkpointTime.set(timeline.time);
    },

    shortForward() {
      timeline.forward(SHORT_JUMP);
    },

    shortRewind() {
      timeline.rewind(SHORT_JUMP);
    },

    toggleAutoplay() {
      gameplaySettings.autoplay = !gameplaySettings.autoplay;
    },

    togglePlayback() {
      if (timeline.isPlaying) {
        timeline.pause();
      } else {
        timeline.resume();
      }
    },
  };
}
