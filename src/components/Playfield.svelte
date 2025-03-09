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
    combo: number;
    currentJudgementIndex: number;
    judgements: HitObjectJudgement[];
    time: number;
  }

  let { chartObjects, combo, currentJudgementIndex, judgements, time }: Props =
    $props();

  const playfield = new Playfield();
  $effect(() => playfield.updateChartObjects(chartObjects));
  $effect(() => playfield.updateCombo(combo));
  $effect(() => playfield.updateCurrentJudgementIndex(currentJudgementIndex));
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

  function handleWidthChange(newWidth: number) {
    playfield.updateWidth(newWidth);
  }
</script>

<PlayfieldCanvas
  baseWidth={BASE_WIDTH}
  baseHeight={BASE_HEIGHT}
  root={playfield}
  onwidthchange={handleWidthChange}
/>
