<script lang="ts">
  import type { ChartInfo } from '../lib/chart/metadata';
  import { promptChartUpload, type ChartFiles } from '../lib/loader/uploading';
  import MaterialSymbolsUpload2Rounded from '~icons/material-symbols/upload-2-rounded';

  interface Props {
    chartInfo: ChartInfo | null;
    onchartupload?: (chartInfo: ChartFiles) => void;
    ondifficultyselect?: (index: number) => void;
  }

  let { chartInfo, onchartupload, ondifficultyselect }: Props = $props();

  async function handleUploadButtonClick() {
    const chartFiles = await promptChartUpload();

    if (!chartFiles) {
      alert('Invalid beatmap uploaded.');
      return;
    }

    onchartupload?.(chartFiles);
  }
</script>

<div>
  <h3 class="text-2xl font-medium">
    {chartInfo?.title || '[No beatmap/chart selected]'}
  </h3>

  {#if !chartInfo}
    <p>Upload a beatmap/chart first.</p>
  {:else}
    <p>Song by {chartInfo.artist}</p>

    {#if chartInfo.creator}
      <p>Mapped by {chartInfo.creator}</p>
    {/if}
  {/if}

  <button
    class="button-panel mt-3.5 flex w-full justify-center gap-1"
    onclick={handleUploadButtonClick}
  >
    <MaterialSymbolsUpload2Rounded /> Upload Beatmap/Chart
  </button>

  {#if chartInfo}
    <h4 class="mt-3 mb-1">Pick a Diff:</h4>

    <ol class="flex flex-col gap-1">
      {#each chartInfo!.diffs as diff, i}
        <li>
          <button
            class="button-panel flex w-full justify-between gap-1"
            onclick={() => ondifficultyselect?.(i)}
          >
            <span
              class="flex-1 overflow-hidden text-left text-nowrap text-ellipsis"
            >
              {diff.name}
            </span>

            <span>
              ({diff.starRating.toFixed(2)}★{diff.isConvert ? ', Convert' : ''})
            </span>
          </button>
        </li>
      {/each}
    </ol>
  {/if}
</div>
