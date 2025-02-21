<script>
  import Scrubber from './Scrubber.svelte';
  import MaterialSymbolsExpandRounded from '~icons/material-symbols/expand-rounded';
  import MaterialSymbolsFastForwardRounded from '~icons/material-symbols/fast-forward-rounded';
  import MaterialSymbolsFastRewindRounded from '~icons/material-symbols/fast-rewind-rounded';
  import MaterialSymbolsPlayArrowRounded from '~icons/material-symbols/play-arrow-rounded';
  import MaterialSymbolsRestartAltRounded from '~icons/material-symbols/restart-alt-rounded';
  import MaterialSymbolsSkipPreviousRounded from '~icons/material-symbols/skip-previous-rounded';
  import MaterialSymbolsSpeedRounded from '~icons/material-symbols/speed-rounded';
</script>

<div class="flex items-center gap-5 bg-neutral-900 px-3 py-2">
  <button class="button-timeline">
    <MaterialSymbolsPlayArrowRounded />
  </button>

  <div class="flex gap-1">
    <button class="button-timeline">
      <MaterialSymbolsSkipPreviousRounded />
    </button>
    <button class="button-timeline">
      <MaterialSymbolsFastRewindRounded />
    </button>
    <button class="button-timeline">
      <MaterialSymbolsFastForwardRounded />
    </button>
    <button class="button-timeline">
      <MaterialSymbolsRestartAltRounded />
    </button>
  </div>

  <Scrubber class="flex-1 self-stretch" />

  <p>00:00 / 99:99</p>

  <div class="flex items-center gap-2">
    <p class="flex items-center gap-1">
      <MaterialSymbolsSpeedRounded class="inline" /> 1.00
    </p>
    <p class="flex items-center gap-1">
      <MaterialSymbolsExpandRounded class="inline rotate-90" /> 1.00
    </p>
  </div>
</div>
