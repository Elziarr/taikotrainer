<script lang="ts">
  import AudioTab from './components/AudioTab.svelte';
  import GameplayTab from './components/GameplayTab.svelte';
  import KeybindsTab from './components/KeybindsTab.svelte';
  import MapInfo from './components/MapInfo.svelte';
  import MapTab from './components/MapTab.svelte';
  import Playfield from './components/Playfield.svelte';
  import TabGroup from './components/TabGroup.svelte';
  import Timeline from './components/Timeline.svelte';
  import Title from './components/Title.svelte';
  import MdiFile from '~icons/mdi/file';
  import MdiKeyboard from '~icons/mdi/keyboard';
  import MingcuteSettings2Fill from '~icons/mingcute/settings-2-fill';
  import MingcuteTargetLine from '~icons/mingcute/target-line';
  import MingcuteVolumeFill from '~icons/mingcute/volume-fill';
</script>

{#snippet audioTab()}
  <AudioTab />
{/snippet}

{#snippet gameplayTab()}
  <GameplayTab />
{/snippet}

{#snippet keybindsTab()}
  <KeybindsTab />
{/snippet}

{#snippet mapTab()}
  <MapTab />
{/snippet}

<main class="flex min-h-screen flex-col">
  <div class="flex items-start justify-between p-4">
    <Title class="flex items-end" />
    <MapInfo />
  </div>

  <div class="mt-1 flex-col">
    <p class="px-3 text-right">
      <MingcuteTargetLine class="mb-1 inline" />
      <span class="text-2xl">99.99%</span>
    </p>

    <Playfield />
  </div>

  <div class="fixed bottom-0 w-full">
    <div class="relative -z-10 h-[80vh] max-h-96">
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
