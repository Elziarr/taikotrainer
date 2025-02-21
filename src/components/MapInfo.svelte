<script lang="ts">
  import type { ClassValue } from 'svelte/elements';

  interface Props {
    class?: ClassValue;
  }

  let { class: _class }: Props = $props();
</script>

<div class={[_class, 'flex flex-col items-end']}>
  <h2 class="text-2xl font-medium">First Storm -Japanese Version-</h2>

  <p>Cychlo's Inner Oni (5★)</p>
  <p>Mapped by IOException</p>
</div>
