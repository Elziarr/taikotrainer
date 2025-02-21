<script lang="ts">
  import type { ClassValue } from 'svelte/elements';
  import OcticonMarkGithub16 from '~icons/octicon/mark-github-16';

  interface Props {
    class?: ClassValue;
  }

  let { class: _class }: Props = $props();
</script>

<div class={[_class, 'text-neutral-300']}>
  <h1 class="text-2xl">TaikoTrainer</h1>
  <p class="ml-1">v0.1.0</p>

  <a
    class="ml-3 flex min-h-8 min-w-8 items-center justify-center text-xl hover:brightness-125 active:brightness-95"
    href="https://www.youtube.com/"
    target="_blank"
  >
    <OcticonMarkGithub16 class="text-neutral-400" />
  </a>
</div>
