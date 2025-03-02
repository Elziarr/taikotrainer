<script lang="ts">
  import Scrubber from './Scrubber.svelte';
  import MaterialSymbolsExpandRounded from '~icons/material-symbols/expand-rounded';
  import MaterialSymbolsFastForwardRounded from '~icons/material-symbols/fast-forward-rounded';
  import MaterialSymbolsFastRewindRounded from '~icons/material-symbols/fast-rewind-rounded';
  import MaterialSymbolsPauseRounded from '~icons/material-symbols/pause-rounded';
  import MaterialSymbolsPlayArrowRounded from '~icons/material-symbols/play-arrow-rounded';
  import MaterialSymbolsRestartAltRounded from '~icons/material-symbols/restart-alt-rounded';
  import MaterialSymbolsSkipPreviousRounded from '~icons/material-symbols/skip-previous-rounded';
  import MaterialSymbolsSpeedRounded from '~icons/material-symbols/speed-rounded';

  interface Props {
    isPlaying: boolean;
    startTime: number;
    duration: number;
    time: number;
    onplaytoggle: () => void;
    onrewind: () => void;
    onforward: () => void;
    onrestart: () => void;
    onrestartfromprevious: () => void;
    onseek: (nextTime: number) => void;
  }

  let {
    isPlaying,
    startTime,
    duration,
    time,
    onplaytoggle,
    onrewind,
    onforward,
    onrestart,
    onrestartfromprevious,
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
    <button class="button-timeline" onclick={onrestartfromprevious}>
      <MaterialSymbolsRestartAltRounded />
    </button>
  </div>

  <Scrubber
    class="flex-1 self-stretch"
    {startTime}
    endTime={startTime + duration}
    {time}
    {onseek}
  />

  <p>{formatTime(time)} / {formatTime(duration)}</p>

  <div class="flex items-center gap-2">
    <p class="flex items-center gap-1">
      <MaterialSymbolsSpeedRounded class="inline" /> 1.00
    </p>
    <p class="flex items-center gap-1">
      <MaterialSymbolsExpandRounded class="inline rotate-90" /> 1.00
    </p>
  </div>
</div>
