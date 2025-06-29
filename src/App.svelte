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
  import { Timeline } from './lib/gameplay/AudioTimeline.svelte';
  import { AutoPlayer } from './lib/gameplay/AutoPlayer.svelte';
  import { Judger } from './lib/gameplay/Judger.svelte';
  import { SfxPlayer } from './lib/gameplay/SfxPlayer.svelte';
  import { initActions } from './lib/gameplay/actions';
  import { gameInput, type GameInput } from './lib/gameplay/input.svelte';
  import { HitCircleJudgement } from './lib/gameplay/judgements';
  import { bindKeybinds } from './lib/gameplay/keybinds';
  import { Scorer } from './lib/gameplay/scorer.svelte';
  import { GameplaySettings } from './lib/gameplay/settings/gameplay.svelte';
  import {
    loadAudioFile,
    loadChartMetadata,
    loadChartObjects,
  } from './lib/loading/loading';
  import type { ChartFiles } from './lib/loading/uploading';
  import { Howl } from 'howler';
  import MdiFile from '~icons/mdi/file';
  import MdiKeyboard from '~icons/mdi/keyboard';
  import MingcuteSettings2Fill from '~icons/mingcute/settings-2-fill';
  import MingcuteTargetLine from '~icons/mingcute/target-line';
  import MingcuteVolumeFill from '~icons/mingcute/volume-fill';

  let playfield: Playfield;

  let chartInfo: ChartInfoType | null = $state.raw(null);
  let chartObjects: ChartObjects | null = $state.raw(null);
  let checkpointTime: number | null = $state(null);

  const timeline = new Timeline({
    onseek: handleTimelineSeek,
    ontick: handleTimelineTick,
  });
  const sfxPlayer = new SfxPlayer();

  const judger = new Judger({
    ongreat: dt => {
      scorer.scoreGreat(dt);
      playfield.displayHitDelta(dt);
    },
    ongood: dt => {
      scorer.scoreGood(dt);
      playfield.displayHitDelta(dt);
    },
    onmiss: () => scorer.scoreMiss(),
  });
  const scorer = new Scorer();
  const autoplayer = new AutoPlayer({ ongameinput: applyGameInput });

  let showLoadingOverlay = $state(false);

  $effect(() => {
    autoplayer.active = GameplaySettings.autoplay;
  });
  $effect(() => {
    timeline.speedMultiplier = GameplaySettings.speedMultiplier;
  });
  $effect(() => {
    judger.greatWindow = GameplaySettings.greatWindow;
    judger.goodWindow = GameplaySettings.goodWindow;
    judger.missWindow = GameplaySettings.missWindow;
  });

  const actions = initActions({
    checkpointTime: {
      get: () => checkpointTime,
      set: value => (checkpointTime = value),
    },
    timeline,
    gameplaySettings: GameplaySettings,
  });
  bindKeybinds(actions);

  function applyGameInput(input: GameInput) {
    judger.bypassTimeJudgements = false;

    judger.judgeInput(input);
    playfield.displayDrumInput(input.type);

    const currJudgeRecord = judger.judgements[judger.currentIndex];
    const prevJudgeIndex = Math.max(0, judger.currentIndex - 1);
    const prevJudgeRecord = judger.judgements[prevJudgeIndex];
    const toPlayBigSound =
      currJudgeRecord instanceof HitCircleJudgement &&
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

    setChartObjects(null, null);
    GameplaySettings.speedMultiplier = 1.0;
    GameplaySettings.densityMultiplier = 1.0;

    chartInfo = nextChartInfo;
    showLoadingOverlay = false;
  }

  async function handleDifficultySelect(index: number) {
    showLoadingOverlay = true;

    // TODO: Don't load the same audio twice (especially when simply diff changing)
    setChartObjects(
      await loadChartObjects(chartInfo!.diffs[index]),
      await loadAudioFile(chartInfo!.audioFile),
    );

    showLoadingOverlay = false;
  }

  function handleGameInput(input: GameInput) {
    if (timeline.isPlaying && autoplayer.active) {
      return;
    }

    applyGameInput(input);
  }

  function handleTimelineTick(currTime: number) {
    judger.time = currTime;
    autoplayer.time = currTime;
  }

  function handleTimelineSeek(nextTime: number) {
    autoplayer.seek(nextTime);

    judger.resetTo(nextTime);
    scorer.reset();
    playfield.resetJudgements();

    if (timeline.time !== timeline.startTime) {
      judger.bypassTimeJudgements = true;
    }
  }

  function setChartObjects(co: ChartObjects | null, audio: Howl | null) {
    chartObjects = co;

    timeline.setChart(chartObjects, audio);
    checkpointTime = null;

    judger.chartObjects = chartObjects;
    autoplayer.chartObjects = chartObjects;
    scorer.reset();

    playfield.resetJudgements();
  }
</script>

<main class="flex min-h-screen flex-col">
  <div class="flex items-start justify-between p-4">
    <Title class="flex items-end" />
    <ChartInfo {chartInfo} diff={chartObjects?.diff} />
  </div>

  <div class="mt-[min(4vh,5rem)] flex-col">
    <p class="px-3 text-right">
      <MingcuteTargetLine class="mb-1 inline" />
      <span class="text-2xl">{scorer.accuracy.toFixed(2)}%</span>
    </p>

    <Playfield
      bind:this={playfield}
      {chartObjects}
      {checkpointTime}
      coloredJudgements={GameplaySettings.coloredJudgements}
      combo={scorer.combo}
      constantDensity={GameplaySettings.constantDensity}
      currentJudgementIndex={judger.currentIndex}
      densityMultiplier={GameplaySettings.densityMultiplier}
      duration={timeline.duration}
      judgements={judger.judgements}
      goodWindow={GameplaySettings.goodWindow}
      greatWindow={GameplaySettings.greatWindow}
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
      {checkpointTime}
      densityMultiplier={GameplaySettings.densityMultiplier}
      duration={timeline.duration}
      isPlaying={timeline.isPlaying}
      kiaiTimes={chartObjects?.kiaiTimeEvents ?? []}
      startTime={timeline.startTime}
      speedMultiplier={GameplaySettings.speedMultiplier}
      time={timeline.time}
      oncheckpointtimeset={actions.setCheckpointTime}
      onforward={actions.forward}
      onplaytoggle={actions.togglePlayback}
      onrestart={actions.restart}
      onrestartfromprevious={actions.restartFromPrevious}
      onrewind={actions.rewind}
      onseek={nextTime => timeline.seek(nextTime)}
    />
  </div>
</main>

{#if showLoadingOverlay}
  <LoadingOverlay />
{/if}

<svelte:window
  use:gameInput={{
    getStartTimestamp: () => timeline.startTimestamp || 0,
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
  <GameplayTab settings={GameplaySettings} />
{/snippet}

{#snippet audioTab()}
  <AudioTab />
{/snippet}

{#snippet keybindsTab()}
  <KeybindsTab />
{/snippet}
