<script lang="ts">
  import {
    KeybindSettings,
    type KeybindName,
  } from '../lib/gameplay/settings/keybinds.svelte';
  import SettingGroup from './SettingGroup.svelte';

  let keybindToSet: KeybindName | null = null;

  function handleKeyDown(e: KeyboardEvent) {
    if (
      !keybindToSet ||
      e.key === 'Control' ||
      e.key === 'Shift' ||
      e.key === 'Alt'
    ) {
      return;
    }

    let keybindString = '';
    if (e.ctrlKey) keybindString += 'ctrl+';
    if (e.shiftKey) keybindString += 'shift+';
    if (e.altKey) keybindString += 'alt+';
    keybindString += e.key;

    const keybindName = KeybindSettings.hasKeybind(keybindString);
    if (keybindName) {
      alert(`That keybind already in use by ${keybindName}.`);
    } else {
      KeybindSettings.setKeybind(keybindToSet!, keybindString);
    }

    keybindToSet = null;
    KeybindSettings.keybindSetPending = false;
  }
</script>

<SettingGroup heading="Keybinds">
  {#each KeybindSettings.keybinds as [name, keybind] (name)}
    <p>{name}</p>
    <button
      class="button-panel p-0"
      onclick={() => {
        keybindToSet = name;
        KeybindSettings.keybindSetPending = true;
      }}
    >
      {#if name === keybindToSet}
        ?
      {:else}
        {keybind}
      {/if}
    </button>
  {/each}
</SettingGroup>

<svelte:window onkeydown={handleKeyDown} />
