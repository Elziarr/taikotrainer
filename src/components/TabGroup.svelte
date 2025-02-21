<script lang="ts">
  import type { Component, Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';

  interface Props {
    class?: ClassValue;
    items: { heading: string | Component; content: Snippet }[];
  }

  let { class: _class, items }: Props = $props();

  let parentElem: HTMLDivElement;

  let currentTabIndex: number | null = $state(null);

  function handleClick(event: MouseEvent) {
    if (currentTabIndex === null) return;

    const target = event.target as HTMLElement;
    if (
      !target.closest('button') &&
      !target.closest('input') &&
      !parentElem.contains(target)
    ) {
      currentTabIndex = null;
    }
  }
</script>

<svelte:window onclick={handleClick} />

<div
  bind:this={parentElem}
  class={[
    _class,
    'flex h-full flex-col transition-[top]',
    currentTabIndex === null ? 'top-[calc(100%-2.2rem)]' : 'top-0',
  ]}
>
  <ol class="flex opacity-90">
    {#each items as item, i}
      <li>
        <button
          class={[
            'relative flex min-w-18 items-center justify-center p-2 ',
            currentTabIndex === i
              ? 'bg-neutral-500'
              : 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900',
            i === items.length - 1 ? 'rounded-tr-sm' : '',
          ]}
          onclick={() => (currentTabIndex = i)}
        >
          {#if typeof item.heading === 'string'}
            {item.heading}
          {:else}
            <item.heading />
          {/if}
        </button>
      </li>
    {/each}
  </ol>

  <div class="flex-1 overflow-auto rounded-tr-sm bg-neutral-500 p-4 opacity-90">
    {@render items[currentTabIndex!]?.content()}
  </div>
</div>
