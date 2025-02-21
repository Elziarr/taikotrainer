<script lang="ts">
  import { Application, Container } from 'pixi.js';

  interface Props {
    baseWidth: number;
    baseHeight: number;
    /**
     * Percentage of the screen height that the canvas should take up, with
     * `baseHeight` as the maximum bound.
     */
    heightScaleFactor?: number;
    root?: Container;
  }

  let {
    baseWidth,
    baseHeight,
    heightScaleFactor = 0.5,
    root = new Container(),
  }: Props = $props();

  let canvasElem: HTMLCanvasElement;

  const pixiApp = new Application();

  $effect(() => {
    pixiApp
      .init({ antialias: true, canvas: canvasElem, background: '0x353535' })
      .then(() => resizeToFit());
  });

  $effect(() => {
    pixiApp.stage = root;
  });

  function resizeToFit() {
    // Step 1: Determine the actual canvas size, factoring in the width and
    // height scales.
    const canvasWidth = canvasElem.parentElement
      ? canvasElem.parentElement.clientWidth
      : window.innerWidth;
    const widthResizeScale = Math.min(canvasWidth / baseWidth, 1);

    const canvasHeight =
      Math.min(heightScaleFactor * window.innerHeight, baseHeight) *
      widthResizeScale;

    // Step 2: Scale the renderer size to the actual canvas size, with the
    // renderer width taking up the whole canvas width.
    const rendererResizeScale = Math.min(
      canvasWidth / baseWidth,
      canvasHeight / baseHeight,
    );

    pixiApp.renderer.resize(canvasWidth / rendererResizeScale, baseHeight);
    canvasElem.style.maxHeight = `${canvasHeight}px`;
  }
</script>

<svelte:window on:resize={resizeToFit} />

<canvas bind:this={canvasElem} class="w-full">
  Sorry, canvas isn't supported.
</canvas>
