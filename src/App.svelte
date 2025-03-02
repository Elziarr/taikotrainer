<script lang="ts">
  import AudioTab from './components/AudioTab.svelte';
  import ChartInfo from './components/ChartInfo.svelte';
  import ChartTab from './components/ChartTab.svelte';
  import GameplayTab from './components/GameplayTab.svelte';
  import KeybindsTab from './components/KeybindsTab.svelte';
  import LoadingOverlay from './components/LoadingOverlay.svelte';
  import Playfield from './components/Playfield.svelte';
  import TabGroup from './components/TabGroup.svelte';
  import TimelineComponent from './components/Timeline.svelte';
  import Title from './components/Title.svelte';
  import type { ChartObjects } from './lib/chart/ChartObjects';
  import type { ChartInfo as ChartInfoType } from './lib/chart/metadata';
  import { AudioPlayer } from './lib/gameplay/AudioPlayer.svelte';
  import { Timeline } from './lib/gameplay/Timeline.svelte';
  import {
    loadAudioFile,
    loadChartMetadata,
    loadChartObjects,
  } from './lib/loader/loading';
  import type { ChartFiles } from './lib/loader/uploading';
  import MdiFile from '~icons/mdi/file';
  import MdiKeyboard from '~icons/mdi/keyboard';
  import MingcuteSettings2Fill from '~icons/mingcute/settings-2-fill';
  import MingcuteTargetLine from '~icons/mingcute/target-line';
  import MingcuteVolumeFill from '~icons/mingcute/volume-fill';

  let chartInfo: ChartInfoType | null = $state.raw(null);
  let chartObjects: ChartObjects | null = $state.raw(null);

  const timeline = new Timeline(handleTimelineTick, handleTimelineSeek);
  const audioPlayer = new AudioPlayer();

  let showLoadingOverlay = $state(false);

  async function handleChartUpload(files: ChartFiles) {
    showLoadingOverlay = true;

    const nextChartInfo = await loadChartMetadata(files);

    if (!nextChartInfo) {
      alert('Uploaded beatmap does not have taiko diffs.');
      showLoadingOverlay = false;
      return;
    }

    chartInfo = nextChartInfo;
    showLoadingOverlay = false;
  }

  async function handleDifficultySelect(index: number) {
    showLoadingOverlay = true;

    // TODO: Don't load the same audio twice (especially when simply diff changing)
    const chartAudio = await loadAudioFile(chartInfo!.audioFile);
    audioPlayer.audio = chartAudio;

    chartObjects = await loadChartObjects(chartInfo!.diffs[index]);
    timeline.chartObjects = chartObjects;
    timeline.chartDuration =
      chartObjects?.getDuration(audioPlayer.audio!.duration() * 1000) ?? 0;

    showLoadingOverlay = false;
  }

  function handleTimelinePlayToggle() {
    if (timeline.isPlaying) {
      timeline.pause();
      audioPlayer.pause();
    } else {
      timeline.resume();
      audioPlayer.resume();
    }
  }

  function handleTimelineTick(currTime: number) {
    audioPlayer.time = currTime;
  }

  function handleTimelineSeek(nextTime: number) {
    audioPlayer.seek(nextTime);
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

    <TimelineComponent
      isPlaying={timeline.isPlaying}
      startTime={timeline.startTime}
      duration={timeline.chartDuration}
      time={timeline.time}
      onplaytoggle={handleTimelinePlayToggle}
      onrewind={() => timeline.rewind()}
      onforward={() => timeline.forward()}
      onrestart={() => timeline.restart()}
      onrestartfromprevious={() => {}}
      onseek={nextTime => timeline.seek(nextTime)}
    />
  </div>
</main>

{#if showLoadingOverlay}
  <LoadingOverlay />
{/if}
