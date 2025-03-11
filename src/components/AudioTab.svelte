<script lang="ts">
  import { AudioSettings } from '../lib/gameplay/settings/audio.svelte';
  import SettingGroup from './SettingGroup.svelte';
</script>

<SettingGroup heading="Volume">
  <label for="sfx">Music</label>
  <span class="flex items-center gap-2">
    <input
      class="flex-1"
      type="range"
      id="sfx"
      name="sfx"
      min="0"
      max="100"
      value={AudioSettings.musicVolume * 100}
      oninput={e => {
        const target = e.target as HTMLInputElement;
        AudioSettings.musicVolume = Number(target.value) / 100;
      }}
    />
    <p>{(AudioSettings.musicVolume * 100).toFixed(0)}%</p>
  </span>

  <label for="sfx">Hitsounds</label>
  <span class="flex items-center gap-2">
    <input
      class="flex-1"
      type="range"
      id="sfx"
      name="sfx"
      min="0"
      max="100"
      value={AudioSettings.sfxVolume * 100}
      oninput={e => {
        const target = e.target as HTMLInputElement;
        AudioSettings.sfxVolume = Number(target.value) / 100;
      }}
    />
    <p>{(AudioSettings.sfxVolume * 100).toFixed(0)}%</p>
  </span>
</SettingGroup>
