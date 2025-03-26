export const MIN_MULTIPLIER_VALUE = 0.05;

class _GameplaySettings {
  private _goodWindow = $state(75);
  private _greatWindow = $state(25);
  private _missWindow = $state(108);
  private _offset = $state(0);

  autoplay = $state(false);
  coloredJudgements = $state(false);
  constantDensity = $state(false);
  densityMultiplier = $state(1.0);
  speedMultiplier = $state(1.0);

  constructor() {
    const storedStr = localStorage.getItem('globalGameplaySettings');

    if (!storedStr) {
      return;
    }

    const storedSettings = JSON.parse(storedStr);
    this._goodWindow = storedSettings.goodWindow;
    this._greatWindow = storedSettings.greatWindow;
    this._missWindow = storedSettings.missWindow;
    this._offset = storedSettings.offset;
  }

  get goodWindow() {
    return this._goodWindow;
  }

  set goodWindow(v: number) {
    this._goodWindow = v;
    this._storeSettings();
  }

  get greatWindow() {
    return this._greatWindow;
  }

  set greatWindow(v: number) {
    this._greatWindow = v;
    this._storeSettings();
  }

  get missWindow() {
    return this._missWindow;
  }

  set missWindow(v: number) {
    this._missWindow = v;
    this._storeSettings();
  }

  get offset() {
    return this._offset;
  }

  set offset(v: number) {
    this._offset = v;
    this._storeSettings();
  }

  private _storeSettings() {
    localStorage.setItem(
      'globalGameplaySettings',
      JSON.stringify({
        goodWindow: this._goodWindow,
        greatWindow: this._greatWindow,
        missWindow: this._missWindow,
        offset: this._offset,
      }),
    );
  }

  reset() {
    this.autoplay = false;
    this.coloredJudgements = false;
    this.constantDensity = false;
    this.densityMultiplier = 1.0;
    this.speedMultiplier = 1.0;
  }
}

export type GameplaySettings = _GameplaySettings;
export const GameplaySettings = new _GameplaySettings();
