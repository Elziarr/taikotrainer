<script>
  import SettingGroup from './SettingGroup.svelte';
</script>

<SettingGroup heading="Volume">
  <label for="sfx">Music</label>
  <span class="flex items-center gap-2">
    <input class="flex-1" type="range" id="sfx" name="sfx" min="0" max="100" />
    <p>100%</p>
  </span>

  <label for="sfx">Hitsounds</label>
  <span class="flex items-center gap-2">
    <input class="flex-1" type="range" id="sfx" name="sfx" min="0" max="100" />
    <p>100%</p>
  </span>
</SettingGroup>
