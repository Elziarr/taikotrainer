import type { ChartObjects } from '../chart/ChartObjects';
import { Balloon, Drumroll, HitCircle } from '../chart/hitobjects';
import type { GameInput } from './input.svelte';
import { GameplaySettings } from './settings/gameplay.svelte';

interface AutoPlayerParams {
  ongameinput: (input: GameInput) => void;
}

export class AutoPlayer {
  private _active = false;
  private _chartObjects: ChartObjects | null = null;
  private _inputs: GameInput[] = [];
  private _currentInputIndex = 0;
  private _time = 0;

  private _ongameinput: AutoPlayerParams['ongameinput'];

  constructor(params: AutoPlayerParams) {
    this._ongameinput = params.ongameinput;
  }

  get active() {
    return this._active;
  }

  set active(v: boolean) {
    this._active = v;
    this._determineInputs();
  }

  get chartObjects() {
    return this._chartObjects;
  }

  set chartObjects(v: ChartObjects | null) {
    this._chartObjects = v;
    this._determineInputs();
  }

  get time() {
    return this._time;
  }

  set time(v: number) {
    this._time = v;
    this._checkForPassedInputs();
  }

  private _checkForPassedInputs() {
    if (
      this._time < this._inputs[this._currentInputIndex]?.time ||
      this._currentInputIndex >= this._inputs.length
    ) {
      return;
    }

    // Skip inputs that are already too late to consider.
    while (
      this._currentInputIndex < this._inputs.length &&
      this._time >= this._inputs[this._currentInputIndex].time
    ) {
      this._currentInputIndex += 1;
    }

    this._ongameinput(this._inputs[this._currentInputIndex - 1]);

    // Handle inputs for big notes that are hit at the same time.
    if (
      this._currentInputIndex >= 2 &&
      this._inputs[this._currentInputIndex - 2].time ===
        this._inputs[this._currentInputIndex - 1].time
    ) {
      this._ongameinput(this._inputs[this._currentInputIndex - 2]);
    }
  }

  private _determineInputs() {
    this._inputs = [];

    if (!this._chartObjects || !this._active) {
      return;
    }

    let atLeftSide = true;

    for (const ho of this._chartObjects.hitObjects) {
      if (ho instanceof HitCircle) {
        if (ho.isBig) {
          this._inputs.push({
            time: ho.time + GameplaySettings.offset,
            type: ho.isKa ? 'left_ka' : 'left_don',
          });

          this._inputs.push({
            time: ho.time + GameplaySettings.offset,
            type: ho.isKa ? 'right_ka' : 'right_don',
          });

          continue;
        }

        if (ho.isKa) {
          this._inputs.push({
            time: ho.time + GameplaySettings.offset,
            type: atLeftSide ? 'left_ka' : 'right_ka',
          });

          atLeftSide = !atLeftSide;
        } else {
          this._inputs.push({
            time: ho.time + GameplaySettings.offset,
            type: atLeftSide ? 'left_don' : 'right_don',
          });

          atLeftSide = !atLeftSide;
        }
      } else if (ho instanceof Drumroll) {
        const tEvtIndex = this.chartObjects?.getActiveTimingEventIndex(
          this._time,
        );
        const interval =
          this._chartObjects?.timingEvents[tEvtIndex!].beatLength / 4;

        for (let t = ho.time; t < ho.endTime; t += interval) {
          this._inputs.push({
            time: t,
            type: atLeftSide ? 'left_don' : 'right_don',
          });

          atLeftSide = !atLeftSide;
        }
      } else if (ho instanceof Balloon) {
        let isDon = true;

        const interval = (0.8 * ho.duration) / ho.hitCount;
        for (let i = 0; i < ho.hitCount; i++) {
          this._inputs.push({
            time: ho.time + i * interval,
            type: isDon
              ? atLeftSide
                ? 'left_don'
                : 'right_don'
              : atLeftSide
                ? 'left_ka'
                : 'right_ka',
          });

          atLeftSide = !atLeftSide;
          isDon = !isDon;
        }
      }
    }
  }

  private _resetCurrentInputIndex() {
    let lo = 0;
    let hi = this._inputs.length;

    while (lo !== hi) {
      const mid = Math.floor((lo + hi) / 2);

      if (this._inputs[mid].time <= this._time) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    this._currentInputIndex = lo;
  }

  seek(newTime: number) {
    this._time = newTime;
    this._resetCurrentInputIndex();
    this._checkForPassedInputs();
  }
}
