export class Scorer {
  private _combo = $state(0);
  private _hitError = $state(0);
  private _hitVariance = $state(0);
  private _totalHits = $state(0);
  private _totalMiss = $state(0);
  private _totalGood = $state(0);
  private _totalGreat = $state(0);

  private _accuracy = $derived(
    this._totalHits === 0
      ? 0
      : ((this._totalGreat + 0.5 * this._totalGood) / this._totalHits) * 100,
  );
  private _unstableRate = $derived(Math.sqrt(this._hitVariance) * 10);

  get accuracy() {
    return this._accuracy;
  }

  get combo() {
    return this._combo;
  }

  get hitError() {
    return this._hitError;
  }

  get unstableRate() {
    return this._unstableRate;
  }

  private _recomputeErrorStats(dt: number) {
    // Moving average
    this._hitError =
      (this._hitError * (this._totalHits - 1) + dt) / this._totalHits;

    // Moving variance
    const dFromMean = dt - this._hitError;
    this._hitVariance =
      (this._hitVariance * (this._totalHits - 1) + dFromMean * dFromMean) /
      this._totalHits;
  }

  reset() {
    this._totalHits = 0;
    this._totalMiss = 0;
    this._totalGood = 0;
    this._totalGreat = 0;

    this._combo = 0;
    this._hitError = 0;
    this._hitVariance = 0;
  }

  scoreMiss() {
    this._combo = 0;

    this._totalHits += 1;
    this._totalMiss += 1;
  }

  scoreGood(dt: number) {
    this._combo += 1;

    this._totalHits += 1;
    this._totalGood += 1;

    this._recomputeErrorStats(dt);
  }

  scoreGreat(dt: number) {
    this._combo += 1;

    this._totalHits += 1;
    this._totalGreat += 1;

    this._recomputeErrorStats(dt);
  }
}
