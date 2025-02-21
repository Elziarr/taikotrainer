<script lang="ts">
  import type { ClassValue } from 'svelte/elements';

  interface Props {
    class?: ClassValue;
    kiaiTimes?: { start: number; end: number }[];
  }

  let { class: _class, kiaiTimes = [] }: Props = $props();
</script>

<div class={[_class, 'relative flex items-center']}>
  <input class="z-10 flex-1" type="range" />

  <span
    class="pointer-events-none absolute left-64 block h-50/100 w-32 bg-yellow-200/80"
  ></span>
</div>
