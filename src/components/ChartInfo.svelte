<script lang="ts">
  import type { ChartDiff, ChartInfo } from '../lib/chart/metadata';
  import type { ClassValue } from 'svelte/elements';

  interface Props {
    class?: ClassValue;
    chartInfo?: ChartInfo | null;
    diff?: ChartDiff;
  }

  let { class: _class, chartInfo, diff }: Props = $props();
</script>

<div class={[_class, 'flex flex-col items-end']}>
  <h2 class="text-2xl font-medium">
    {chartInfo?.title || '[No beatmap/chart selected]'}
  </h2>

  {#if diff}
    <p>{diff.name} ({diff.starRating.toFixed(2)}★)</p>
  {:else if !chartInfo}
    <p>Upload a beatmap/chart via the Beatmap Tab!</p>
  {:else if chartInfo}
    <p>Select a difficulty via the Beatmap Tab.</p>
  {:else}
    <br />
  {/if}

  {#if chartInfo?.creator}
    <p>Mapped by {chartInfo.creator}</p>
  {:else}
    <br />
  {/if}
</div>
