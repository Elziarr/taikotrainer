<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';

  interface Props {
    class?: ClassValue;
    children: Snippet;
    heading: string;
  }

  let { class: _class, children, heading }: Props = $props();
</script>

<fieldset class={_class}>
  <legend class="mb-1 text-xl font-medium">{heading}</legend>

  <div class="grid grid-cols-2 items-center gap-1">
    {@render children()}
  </div>
</fieldset>
