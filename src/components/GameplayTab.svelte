<script lang="ts">
  import {
    MIN_MULTIPLIER_VALUE,
    type GameplaySettings,
  } from '../lib/gameplay/settings/gameplay.svelte';
  import SettingGroup from './SettingGroup.svelte';

  interface Props {
    settings: GameplaySettings;
  }

  let { settings }: Props = $props();

  function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
  }
</script>

<div class="flex flex-col gap-4">
  <SettingGroup heading="Difficulty">
    <label for="speedMultipler">Speed Multiplier</label>
    <input
      class="flex-1"
      id="speedMultipler"
      type="number"
      min={MIN_MULTIPLIER_VALUE}
      step="0.05"
      value={settings.speedMultiplier.toFixed(2)}
      oninput={e => {
        const target = e.target as HTMLInputElement;
        settings.speedMultiplier = parseFloat(target.value!);
      }}
    />

    <label for="densityMultiplier">Density Multiplier</label>
    <input
      class="flex-1"
      id="densityMultiplier"
      type="number"
      min={MIN_MULTIPLIER_VALUE}
      step="0.05"
      value={settings.densityMultiplier.toFixed(2)}
      oninput={e => {
        const target = e.target as HTMLInputElement;
        settings.densityMultiplier = parseFloat(target.value!);
      }}
    />

    <label for="constantDensity">Constant Density</label>
    <input
      id="constantDensity"
      type="checkbox"
      bind:checked={settings.constantDensity}
    />

    <label for="autoplay">Autoplay</label>
    <input id="autoplay" type="checkbox" bind:checked={settings.autoplay} />
  </SettingGroup>

  <SettingGroup heading="Timing">
    <label for="coloredJudgements">Colored Judgements</label>
    <input
      id="coloredJudgements"
      type="checkbox"
      bind:checked={settings.coloredJudgements}
    />

    <label for="inputOffset">Input Offset (ms)</label>
    <input
      class="flex-1"
      id="inputOffset"
      type="number"
      min="-25"
      max="25"
      step="1"
      value={settings.offset}
      onchange={e => {
        const target = e.target as HTMLInputElement;
        settings.offset = clamp(
          Number(target.value),
          parseFloat(target.min),
          parseFloat(target.max),
        );
      }}
    />

    <label for="greatWindow">Great Window (ms)</label>
    <input
      class="flex-1"
      id="greatWindow"
      type="number"
      min="1"
      max={settings.judgementWindows.good - 1}
      step="0.1"
      value={settings.judgementWindows.great}
      onchange={e => {
        const target = e.target as HTMLInputElement;
        settings.judgementWindows.great = clamp(
          Number(target.value),
          parseFloat(target.min),
          parseFloat(target.max),
        );
      }}
    />

    <label for="goodWindow">Good Window (ms)</label>
    <input
      class="flex-1"
      id="goodWindow"
      type="number"
      step="0.1"
      min={settings.judgementWindows.great + 1}
      max={settings.judgementWindows.miss - 1}
      value={settings.judgementWindows.good}
      onchange={e => {
        const target = e.target as HTMLInputElement;
        settings.judgementWindows.good = clamp(
          Number(target.value),
          parseFloat(target.min),
          parseFloat(target.max),
        );
      }}
    />

    <label for="missWindow">Miss Window (ms)</label>
    <input
      class="flex-1"
      id="missWindow"
      type="number"
      min={settings.judgementWindows.good + 1}
      step="0.1"
      value={settings.judgementWindows.miss}
      onchange={e => {
        const target = e.target as HTMLInputElement;
        settings.judgementWindows.miss = clamp(
          Number(target.value),
          parseFloat(target.min),
          parseFloat(target.max),
        );
      }}
    />
  </SettingGroup>
</div>
