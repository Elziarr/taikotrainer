<script lang="ts">
  import type { ChartObjects } from '../lib/chart/ChartObjects';
  import {
    BASE_HEIGHT,
    BASE_WIDTH,
    Playfield,
  } from '../lib/playfield/Playfield';
  import PlayfieldCanvas from './PlayfieldCanvas.svelte';

  interface Props {
    chartObjects: ChartObjects | null;
    // inputs: unknown[];
    // judgements: unknown[];
    time: number;
  }

  let { chartObjects, time }: Props = $props();

  const playfield = new Playfield();
  $effect(() => playfield.updateChartObjects(chartObjects));
  $effect(() => playfield.updateTime(time));

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
