<script lang="ts">
  import SettingGroup from './SettingGroup.svelte';
</script>

<div class="flex flex-col gap-4">
  <SettingGroup heading="Difficulty">
    <label for="speedMultipler">Speed Multiplier</label>
    <input
      class="flex-1"
      id="speedMultipler"
      type="number"
      min="0.1"
      step="0.1"
    />

    <label for="densityMultiplier">Density Multiplier</label>
    <input
      class="flex-1"
      id="densityMultiplier"
      type="number"
      min="0.1"
      step="0.1"
    />

    <label for="constantDensity">Constant Density</label>
    <input id="constantDensity" type="checkbox" />

    <label for="autoplay">Autoplay</label>
    <input id="autoplay" type="checkbox" />
  </SettingGroup>

  <SettingGroup heading="Timing">
    <label for="coloredJudgements">Colored Judgements</label>
    <input id="coloredJudgements" type="checkbox" />

    <label for="greatWindow">Great Window</label>
    <input class="flex-1" id="greatWindow" type="number" min="0.1" step="0.1" />

    <label for="goodWindow">Good Window</label>
    <input class="flex-1" id="goodWindow" type="number" min="0.1" step="0.1" />

    <label for="badWindow">Bad Window</label>
    <input class="flex-1" id="badWindow" type="number" min="0.1" step="0.1" />
  </SettingGroup>
</div>
