<script lang="ts">
  import type { ChartObjects } from '../lib/chart/ChartObjects';
  import type { GameInputType } from '../lib/gameplay/input.svelte';
  import type { HitObjectJudgement } from '../lib/gameplay/judgements';
  import {
    BASE_HEIGHT,
    BASE_WIDTH,
    Playfield,
  } from '../lib/playfield/Playfield';
  import PlayfieldCanvas from './PlayfieldCanvas.svelte';

  interface Props {
    chartObjects: ChartObjects | null;
    checkpointTime: number | null;
    coloredJudgements: boolean;
    combo: number;
    constantDensity: boolean;
    currentJudgementIndex: number;
    densityMultiplier: number;
    duration: number;
    goodWindow: number;
    greatWindow: number;
    judgements: HitObjectJudgement[];
    time: number;
  }

  let {
    chartObjects,
    checkpointTime,
    coloredJudgements,
    combo,
    constantDensity,
    currentJudgementIndex,
    densityMultiplier,
    duration,
    goodWindow,
    greatWindow,
    judgements,
    time,
  }: Props = $props();

  const BASE_Y_OFFSET = 75;

  /**
   * For making hit objects fly out of the playfield without getting cut off.
   */
  let yOffset = $state(BASE_Y_OFFSET);

  const playfield = new Playfield();
  playfield.y = BASE_Y_OFFSET;

  // TODO: Better state management!!
  $effect(() => playfield.updateChartObjects(chartObjects));
  $effect(() => playfield.updateCheckpointTime(checkpointTime));
  $effect(() => playfield.updateColoredJudgements(coloredJudgements));
  $effect(() => playfield.updateCombo(combo));
  $effect(() => playfield.updateConstantDensity(constantDensity));
  $effect(() => playfield.updateCurrentJudgementIndex(currentJudgementIndex));
  $effect(() => playfield.updateDensityMultiplier(densityMultiplier));
  $effect(() => playfield.updateDuration(duration));
  $effect(() => playfield.updateGoodWindow(goodWindow));
  $effect(() => playfield.updateGreatWindow(greatWindow));
  $effect(() => playfield.updateJudgements(judgements));
  $effect(() => playfield.updateTime(time));

  export function displayDrumInput(type: GameInputType) {
    playfield.displayDrumInput(type);
  }

  export function displayHitDelta(dt: number) {
    playfield.displayHitDelta(dt);
  }

  export function resetJudgements() {
    playfield.resetJudgements();
  }

  function handleWidthChange(newWidth: number, newHeight: number) {
    const xRatio = Math.min(newWidth / BASE_WIDTH, 1);
    const yRatio = Math.min(newHeight / (BASE_HEIGHT + BASE_Y_OFFSET), 1);
    const playfieldScale = xRatio * yRatio;

    yOffset = BASE_Y_OFFSET * yRatio;
    playfield.y = yOffset;

    playfield.updateWidth(newWidth / playfieldScale);
    playfield.scale.set(playfieldScale);
  }
</script>

<PlayfieldCanvas
  class="relative -z-10"
  baseHeight={BASE_HEIGHT + yOffset}
  root={playfield}
  style="translate: 0 -{yOffset}px;"
  onwidthchange={handleWidthChange}
/>
