<script lang="ts">
  import AudioTab from './components/AudioTab.svelte';
  import ChartInfo from './components/ChartInfo.svelte';
  import ChartTab from './components/ChartTab.svelte';
  import GameplayTab from './components/GameplayTab.svelte';
  import KeybindsTab from './components/KeybindsTab.svelte';
  import LoadingOverlay from './components/LoadingOverlay.svelte';
  import Playfield from './components/Playfield.svelte';
  import TabGroup from './components/TabGroup.svelte';
  import Timeline from './components/Timeline.svelte';
  import Title from './components/Title.svelte';
  import type { ChartObjects } from './lib/chart/ChartObjects';
  import type { ChartInfo as ChartInfoType } from './lib/chart/metadata';
  import { loadChartMetadata, loadChartObjects } from './lib/loader/loading';
  import type { ChartFiles } from './lib/loader/uploading';
  import MdiFile from '~icons/mdi/file';
  import MdiKeyboard from '~icons/mdi/keyboard';
  import MingcuteSettings2Fill from '~icons/mingcute/settings-2-fill';
  import MingcuteTargetLine from '~icons/mingcute/target-line';
  import MingcuteVolumeFill from '~icons/mingcute/volume-fill';

  let chartInfo: ChartInfoType | null = $state.raw(null);
  let chartObjects: ChartObjects | null = $state.raw(null);
  // let beatmapAudio = $state();

  let showLoadingOverlay = $state(false);

  async function handleChartUpload(files: ChartFiles) {
    showLoadingOverlay = true;
    chartInfo = await loadChartMetadata(files.diffs);
    showLoadingOverlay = false;

    if (!chartInfo) {
      alert('Uploaded beatmap does not have taiko diffs.');
    }
  }

  async function handleDifficultySelect(index: number) {
    showLoadingOverlay = true;
    chartObjects = await loadChartObjects(chartInfo!.diffs[index]);
    showLoadingOverlay = false;

    console.log(chartObjects);
  }
</script>

{#snippet mapTab()}
  <ChartTab
    {chartInfo}
    onchartupload={handleChartUpload}
    ondifficultyselect={handleDifficultySelect}
  />
{/snippet}

{#snippet gameplayTab()}
  <GameplayTab />
{/snippet}

{#snippet audioTab()}
  <AudioTab />
{/snippet}

{#snippet keybindsTab()}
  <KeybindsTab />
{/snippet}

<main class="flex min-h-screen flex-col">
  <div class="flex items-start justify-between p-4">
    <Title class="flex items-end" />
    <ChartInfo {chartInfo} diff={chartObjects?.diff} />
  </div>

  <div class="flex-col">
    <p class="px-3 text-right">
      <MingcuteTargetLine class="mb-1 inline" />
      <span class="text-2xl">99.99%</span>
    </p>

    <!-- <Playfield beatmapObjects={chartObjects} /> -->
    <Playfield />
  </div>

  <div class="fixed bottom-0 w-full">
    <div class="relative -z-10 h-[80vh] max-h-[27rem]">
      <TabGroup
        class="absolute w-50/100 max-w-[30rem]"
        items={[
          { heading: MdiFile, content: mapTab },
          { heading: MingcuteSettings2Fill, content: gameplayTab },
          { heading: MingcuteVolumeFill, content: audioTab },
          { heading: MdiKeyboard, content: keybindsTab },
        ]}
      />
    </div>

    <Timeline />
  </div>
</main>

{#if showLoadingOverlay}
  <LoadingOverlay />
{/if}
