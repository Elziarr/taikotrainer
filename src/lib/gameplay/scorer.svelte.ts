export class Scorer {
  private _totalHits = $state(0);
  private _totalMiss = $state(0);
  private _totalGood = $state(0);
  private _totalGreat = $state(0);

  private _combo = $state(0);
  private _accuracy = $derived(
    this._totalHits === 0
      ? 100
      : ((this._totalGreat + 0.5 * this._totalGood) / this._totalHits) * 100,
  );

  get accuracy() {
    return this._accuracy;
  }

  get combo() {
    return this._combo;
  }

  reset() {
    this._totalHits = 0;
    this._totalMiss = 0;
    this._totalGood = 0;
    this._totalGreat = 0;

    this._combo = 0;
  }

  scoreMiss() {
    this._combo = 0;

    this._totalHits += 1;
    this._totalMiss += 1;
  }

  scoreGood() {
    this._combo += 1;

    this._totalHits += 1;
    this._totalGood += 1;
  }

  scoreGreat() {
    this._combo += 1;

    this._totalHits += 1;
    this._totalGreat += 1;
  }
}
