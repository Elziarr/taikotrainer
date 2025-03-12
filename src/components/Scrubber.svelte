<script lang="ts">
  import type { ClassValue } from 'svelte/elements';

  interface Props {
    class?: ClassValue;
    checkpointTime: number | null;
    endTime?: number;
    kiaiTimes?: { start: number; end: number }[];
    startTime?: number;
    time: number;
    onseek: (nextTime: number) => void;
  }

  let {
    class: _class,
    checkpointTime,
    endTime = 0,
    kiaiTimes = [],
    startTime = 0,
    time,
    onseek,
  }: Props = $props();

  function getLeftStyle(timeVal: number) {
    return ((timeVal - startTime) / (endTime - startTime)) * 100;
  }
</script>

<div class={[_class, 'relative flex items-center']}>
  <input
    class="z-10 flex-1"
    type="range"
    min={startTime}
    max={endTime}
    value={time}
    oninput={e => onseek(parseFloat((e.target! as HTMLInputElement).value))}
  />

  <!-- {#each kiaiTimes as { start, end }}
    <span
      class="pointer-events-none absolute block h-50/100 w-32 bg-yellow-200/80"
      style="left: {getLeftStyle(start)}%;"
    ></span>
  {/each} -->

  <span class="absolute inset-0 mx-[5px] flex items-center">
    {#if checkpointTime !== null}
      <span
        class="pointer-events-none absolute block h-85/100 w-1.5 -translate-x-1/2 rounded-sm bg-fuchsia-400/80"
        style="left: {getLeftStyle(checkpointTime)}%;"
      ></span>
    {/if}
  </span>
</div>
