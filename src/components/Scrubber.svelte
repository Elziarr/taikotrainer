<script lang="ts">
  import type { ClassValue } from 'svelte/elements';

  interface Props {
    class?: ClassValue;
    startTime?: number;
    endTime?: number;
    time: number;
    kiaiTimes?: { start: number; end: number }[];
    onseek: (nextTime: number) => void;
  }

  let {
    class: _class,
    time,
    startTime = 0,
    endTime = 0,
    kiaiTimes = [],
    onseek,
  }: Props = $props();
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

  <span
    class="pointer-events-none absolute left-64 block h-50/100 w-32 bg-yellow-200/80"
  ></span>
</div>
