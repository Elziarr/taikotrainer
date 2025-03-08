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
  import { AutoPlayer } from './lib/gameplay/AutoPlayer.svelte';
  import { BeatmapAudioPlayer } from './lib/gameplay/BeatmapAudioPlayer.svelte';
  import { Judger } from './lib/gameplay/Judger.svelte';
  import { SfxPlayer } from './lib/gameplay/SfxPlayer.svelte';
  import { Timeline } from './lib/gameplay/Timeline.svelte';
  import { gameInput, type GameInput } from './lib/gameplay/input.svelte';
  import { HitCircleJudgement } from './lib/gameplay/judgements';
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

  let playfield: Playfield;

  let chartInfo: ChartInfoType | null = $state.raw(null);
  let chartObjects: ChartObjects | null = $state.raw(null);

  const timeline = new Timeline(handleTimelineTick, handleTimelineSeek);
  const beatmapAudioPlayer = new BeatmapAudioPlayer();
  const sfxPlayer = new SfxPlayer();

  const judger = new Judger();
  const autoplayer = new AutoPlayer({ ongameinput: applyGameInput });

  let showLoadingOverlay = $state(false);

  function applyGameInput(input: GameInput) {
    judger.judgeInput(input);
    playfield.displayDrumInput(input.type);

    const prevJudgeIndex = Math.max(0, judger.currentIndex - 1);
    const prevJudgeRecord = judger.judgements[prevJudgeIndex];
    const toPlayBigSound =
      prevJudgeRecord instanceof HitCircleJudgement &&
      prevJudgeRecord.input !== null &&
      prevJudgeRecord.hitBigCorrectly;

    if (input.type === 'left_don' || input.type === 'right_don') {
      if (toPlayBigSound) {
        sfxPlayer.playBigDon();
      } else {
        sfxPlayer.playDon();
      }
    } else {
      if (toPlayBigSound) {
        sfxPlayer.playBigKa();
      } else {
        sfxPlayer.playKa();
      }
    }
  }

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
    beatmapAudioPlayer.audio = chartAudio;

    chartObjects = await loadChartObjects(chartInfo!.diffs[index]);

    timeline.chartObjects = chartObjects;
    timeline.chartDuration =
      chartObjects?.getDuration(beatmapAudioPlayer.audio!.duration() * 1000) ??
      0;
    judger.chartObjects = chartObjects;
    autoplayer.chartObjects = chartObjects;

    showLoadingOverlay = false;
  }

  function handleGameInput(input: GameInput) {
    if (timeline.isPlaying && autoplayer.active) {
      return;
    }

    applyGameInput(input);
  }

  function handleTimelinePlayToggle() {
    if (timeline.isPlaying) {
      timeline.pause();
      beatmapAudioPlayer.pause();
    } else {
      // autoplayer.active = true;

      timeline.resume();
      beatmapAudioPlayer.resume();
    }
  }

  function handleTimelineTick(currTime: number) {
    beatmapAudioPlayer.time = currTime;
    judger.time = currTime;
    autoplayer.time = currTime;
  }

  function handleTimelineSeek(nextTime: number) {
    beatmapAudioPlayer.seek(nextTime);
    judger.seek(nextTime);
    autoplayer.seek(nextTime);
  }
</script>

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

    <Playfield
      bind:this={playfield}
      {chartObjects}
      currentJudgementIndex={judger.currentIndex}
      judgements={judger.judgements}
      time={timeline.time}
    />
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

<svelte:window
  use:gameInput={{
    getStartTimestamp: () => timeline.startTimestamp,
    ongameinput: handleGameInput,
  }}
/>

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
