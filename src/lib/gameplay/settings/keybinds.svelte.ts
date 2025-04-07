import type { ActionName } from '../actions';
import EventEmitter from 'eventemitter3';

type GameInputs = 'leftDon' | 'leftKa' | 'rightDon' | 'rightKa';

const DEFAULT_KEYBINDS: Record<ActionName | GameInputs, string> = {
  clearCheckpointTime: 'shift+m',
  decreaseDensity: '3',
  decreaseSpeed: '1',
  fineDecreaseDensity: 'alt+3',
  fineDecreaseSpeed: 'alt+1',
  fineIncreaseDensity: 'alt+4',
  fineIncreaseSpeed: 'alt+2',
  forward: ']',
  increaseDensity: '4',
  increaseSpeed: '2',
  leftDon: 'f',
  leftKa: 'd',
  longForward: 'shift+]',
  longRewind: 'shift+[',
  restart: 'shift+`',
  restartFromPrevious: '`',
  rewind: '[',
  rightDon: 'j',
  rightKa: 'k',
  setCheckpointTime: 'm',
  shortForward: 'alt+]',
  shortRewind: 'alt+[',
  toggleAutoplay: 'a',
  togglePlayback: 'space',
};

export type KeybindName = keyof typeof DEFAULT_KEYBINDS;
export type KeybindChangeHandler = (
  currKeybind: string,
  prevKeybind: string,
) => void;

class _KeybindSettings {
  private _emitter = new EventEmitter<KeybindName>();
  private _keybinds = $state({ ...DEFAULT_KEYBINDS });

  keybindSetPending = false;

  constructor() {
    const storedKeybindsStr = localStorage.getItem('keybinds');

    if (!storedKeybindsStr) {
      return;
    }

    const storedKeybinds = JSON.parse(storedKeybindsStr);
    this._keybinds = { ...this._keybinds, ...storedKeybinds };
  }

  get keybinds() {
    return Object.entries(this._keybinds) as [KeybindName, string][];
  }

  getKeybind(name: KeybindName) {
    return this._keybinds[name];
  }

  hasKeybind(keybind: string) {
    const i = Object.values(this._keybinds).findIndex(v => v === keybind);
    return i >= 0 ? Object.keys(this._keybinds)[i] : null;
  }

  onKeybindChange(name: KeybindName, handler: KeybindChangeHandler) {
    this._emitter.on(name, handler);
  }

  setKeybind(name: KeybindName, keybind: string) {
    const prevKeybind = this._keybinds[name];

    this._keybinds[name] = keybind;
    this._emitter.emit(name, keybind, prevKeybind);

    localStorage.setItem('keybinds', JSON.stringify(this._keybinds));
  }
}

export type KeybindSettings = _KeybindSettings;
export const KeybindSettings = new _KeybindSettings();
