<script lang="ts">
  import { Application, Container } from 'pixi.js';
  import type { ClassValue } from 'svelte/elements';

  interface Props {
    baseHeight: number;
    class?: ClassValue;
    root?: Container;
    style?: string;
    onwidthchange?: (newWidth: number, newHeight: number) => void;
  }

  let {
    class: _class,
    baseHeight,
    root = new Container(),
    style,
    onwidthchange = () => {},
  }: Props = $props();

  let canvasElem: HTMLCanvasElement;

  const pixiApp = new Application();

  $effect(() => {
    pixiApp
      .init({
        antialias: true,
        canvas: canvasElem,
        // background: '0x350000',
        resolution: window.devicePixelRatio,
      })
      .then(() => resizeToFit());
  });

  $effect(() => {
    pixiApp.stage = root;
  });

  function resizeToFit() {
    const canvasWidth = canvasElem.parentElement
      ? canvasElem.parentElement.clientWidth
      : window.innerWidth;

    pixiApp.renderer.resize(canvasWidth, canvasElem.clientHeight);
    onwidthchange(canvasElem.clientWidth, canvasElem.clientHeight);
  }
</script>

<svelte:window on:resize={resizeToFit} />

<canvas
  bind:this={canvasElem}
  class={[_class, 'w-full']}
  style="height: min(55vh, {baseHeight}px); {style};"
>
  Sorry, canvas isn't supported.
</canvas>
