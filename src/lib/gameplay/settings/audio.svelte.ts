class _AudioSettings {
  private _musicVolume = $state(0.5);
  private _sfxVolume = $state(0.5);

  constructor() {
    const storedStr = localStorage.getItem('audioSettings');

    if (!storedStr) {
      return;
    }

    const storedSettings = JSON.parse(storedStr);
    this._musicVolume = storedSettings.musicVolume;
    this._sfxVolume = storedSettings.sfxVolume;
  }

  get musicVolume() {
    return this._musicVolume;
  }

  set musicVolume(v: number) {
    this._musicVolume = v;
    this._storeSettings();
  }

  get sfxVolume() {
    return this._sfxVolume;
  }

  set sfxVolume(v: number) {
    this._sfxVolume = v;
    this._storeSettings();
  }

  private _storeSettings() {
    localStorage.setItem(
      'audioSettings',
      JSON.stringify({
        musicVolume: this._musicVolume,
        sfxVolume: this._sfxVolume,
      }),
    );
  }
}

export type AudioSettings = _AudioSettings;
export const AudioSettings = new _AudioSettings();
