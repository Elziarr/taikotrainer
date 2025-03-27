<script lang="ts">
  import type { KiaiTimeEvent } from '../lib/chart/events';
  import Scrubber from './Scrubber.svelte';
  import MaterialSymbolsExpandRounded from '~icons/material-symbols/expand-rounded';
  import MaterialSymbolsFastForwardRounded from '~icons/material-symbols/fast-forward-rounded';
  import MaterialSymbolsFastRewindRounded from '~icons/material-symbols/fast-rewind-rounded';
  import MaterialSymbolsPauseRounded from '~icons/material-symbols/pause-rounded';
  import MaterialSymbolsPlayArrowRounded from '~icons/material-symbols/play-arrow-rounded';
  import MaterialSymbolsRestartAltRounded from '~icons/material-symbols/restart-alt-rounded';
  import MaterialSymbolsSkipPreviousRounded from '~icons/material-symbols/skip-previous-rounded';
  import MaterialSymbolsSpeedRounded from '~icons/material-symbols/speed-rounded';
  import MynauiPinSolid from '~icons/mynaui/pin-solid';

  interface Props {
    checkpointTime: number | null;
    densityMultiplier: number;
    duration: number;
    isPlaying: boolean;
    kiaiTimes: KiaiTimeEvent[];
    speedMultiplier: number;
    startTime: number;
    time: number;
    oncheckpointtimeset: () => void;
    onforward: () => void;
    onplaytoggle: () => void;
    onrestart: () => void;
    onrestartfromprevious: () => void;
    onrewind: () => void;
    onseek: (nextTime: number) => void;
  }

  let {
    checkpointTime,
    densityMultiplier,
    duration,
    isPlaying,
    kiaiTimes,
    speedMultiplier,
    startTime,
    time,
    oncheckpointtimeset,
    onforward,
    onplaytoggle,
    onrestart,
    onrestartfromprevious,
    onrewind,
    onseek,
  }: Props = $props();

  function formatTime(time: number) {
    const absTime = Math.abs(time);

    const minutes = Math.floor(absTime / 60000);
    const seconds = Math.floor((absTime % 60000) / 1000);

    const formattedSign = time < 0 ? '-' : '';
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    return `${formattedSign}${formattedMinutes}:${formattedSeconds}`;
  }
</script>

<div class="flex items-center gap-5 bg-neutral-900 px-3 py-2">
  <button class="button-timeline" onclick={onplaytoggle}>
    {#if isPlaying}
      <MaterialSymbolsPauseRounded />
    {:else}
      <MaterialSymbolsPlayArrowRounded />
    {/if}
  </button>

  <div class="flex gap-1">
    <button class="button-timeline" onclick={onrestart}>
      <MaterialSymbolsSkipPreviousRounded />
    </button>
    <button class="button-timeline" onclick={onrewind}>
      <MaterialSymbolsFastRewindRounded />
    </button>
    <button class="button-timeline" onclick={onforward}>
      <MaterialSymbolsFastForwardRounded />
    </button>
  </div>

  <div class="flex gap-1">
    <button class="button-timeline" onclick={oncheckpointtimeset}>
      <MynauiPinSolid class="scale-90" />
    </button>
    <button class="button-timeline" onclick={onrestartfromprevious}>
      <MaterialSymbolsRestartAltRounded />
    </button>
  </div>

  <Scrubber
    class="flex-1 self-stretch"
    {checkpointTime}
    endTime={startTime + duration}
    {kiaiTimes}
    {startTime}
    {time}
    {onseek}
  />

  <p>{formatTime(time)} / {formatTime(duration)}</p>

  <div class="flex items-center gap-2">
    <p class="flex items-center gap-1">
      <MaterialSymbolsSpeedRounded class="inline" />
      {speedMultiplier.toFixed(2)}
    </p>
    <p class="flex items-center gap-1">
      <MaterialSymbolsExpandRounded class="inline rotate-90" />
      {densityMultiplier.toFixed(2)}
    </p>
  </div>
</div>
