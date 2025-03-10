class _GameplaySettings {
  autoplay = $state(true);
  coloredJudgements = $state(false);
  constantDensity = $state(false);
  densityMultiplier = $state(1.0);
  judgementWindows = $state({
    great: 25,
    good: 75,
    miss: 108,
  });
  offset = $state(0);
  speedMultiplier = $state(1.0);

  reset() {
    this.autoplay = true;
    this.coloredJudgements = false;
    this.constantDensity = false;
    this.densityMultiplier = 1.0;
    this.judgementWindows = {
      great: 25,
      good: 75,
      miss: 108,
    };
    this.offset = 0;
    this.speedMultiplier = 1.0;
  }
}

export type GameplaySettings = _GameplaySettings;
export const GameplaySettings = new _GameplaySettings();
