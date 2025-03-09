import type { ChartObjects } from '../chart/ChartObjects';
import { Balloon, Drumroll, HitCircle } from '../chart/hitobjects';
import type { GameInput } from './input.svelte';
import {
  BalloonJudgement,
  DrumrollJudgement,
  HitCircleJudgement,
  type HitObjectJudgement,
} from './judgements';

interface JudgerParams {
  onmiss: () => void;
  ongood: (dt: number) => void;
  ongreat: (dt: number) => void;
}

const BIG_HITCIRCLE_WINDOW = 30;

const GREAT_WINDOW = 25;
const OK_WINDOW = 75;
const MISS_WINDOW = 108;

export class Judger {
  private _chartObjects: ChartObjects | null = null;
  private _time = 0;

  private _judgements: HitObjectJudgement[] = $state([]);
  private _currentIndex = $state(0);
  private _previousInputTime = 0;

  private _onmiss: JudgerParams['onmiss'];
  private _ongood: JudgerParams['ongood'];
  private _ongreat: JudgerParams['ongreat'];

  constructor(params: JudgerParams) {
    this._onmiss = params.onmiss;
    this._ongood = params.ongood;
    this._ongreat = params.ongreat;
  }

  get chartObjects() {
    return this._chartObjects;
  }

  set chartObjects(v: ChartObjects | null) {
    this._chartObjects = v;
    this._setInitialJudgements();
  }

  get currentIndex() {
    return this._currentIndex;
  }

  get judgements() {
    return this._judgements;
  }

  get time() {
    return this._time;
  }

  set time(v: number) {
    this._time = v;
    this._updateJudgementsByTime();
  }

  private _judgeBalloonByInput(ho: Balloon, input: GameInput) {
    if (input.time < ho.time) {
      return;
    }

    const record = this._judgements[this._currentIndex] as BalloonJudgement;
    record.inputs.push(input);

    if (record.inputs.length === record.targetCount) {
      this._currentIndex += 1;
    }
  }

  /**
   * Handles the case where no input was made to a balloon.
   * @param ho
   * @returns `true` if a balloon was NOT judged, else `false`
   */
  private _judgeBalloonByTime(ho: Balloon) {
    if (this._time > ho.endTime) {
      this._currentIndex += 1;
      return false;
    }

    return true;
  }

  private _judgeDrumrollByInput(ho: Drumroll, input: GameInput) {
    if (input.time < ho.time) {
      return;
    }

    const record = this._judgements[this._currentIndex] as DrumrollJudgement;
    record.inputs.push(input);
  }

  /**
   * Handles the case where no input was made to a drumroll.
   * @param ho
   * @returns `true` if a drumroll was NOT judged, else `false`
   */
  private _judgeDrumrollByTime(ho: Drumroll) {
    if (this._time > ho.endTime) {
      this._currentIndex += 1;
      return false;
    }

    return true;
  }

  private _judgeHitCircleByInput(ho: HitCircle, input: GameInput) {
    // Too early or too late to hit a hit circle:
    if (
      input.time < ho.time - MISS_WINDOW ||
      input.time > ho.time + OK_WINDOW
    ) {
      return;
    }

    // For wrong input:
    if (
      (!ho.isKa && (input.type === 'left_ka' || input.type === 'right_ka')) ||
      (ho.isKa && (input.type === 'left_don' || input.type === 'right_don'))
    ) {
      return;
    }

    const record = this._judgements[this._currentIndex] as HitCircleJudgement;

    // Handle the 2nd input for big hit circles.
    if (
      ho.isBig &&
      record.judgement !== null &&
      input.time - this._previousInputTime <= BIG_HITCIRCLE_WINDOW
    ) {
      record.hitBigCorrectly = true;
      this._currentIndex += 1;
      return;
    }

    // Perform the actual timing judgement.
    const timeDiff = input.time - ho.time;
    const absTimeDiff = Math.abs(timeDiff);

    record.hitDelta = timeDiff;
    record.input = input;

    if (absTimeDiff < GREAT_WINDOW) {
      record.judgement = 'great';
      this._ongreat(timeDiff);
    } else if (absTimeDiff < OK_WINDOW) {
      record.judgement = 'good';
      this._ongood(timeDiff);
    } else if (absTimeDiff <= MISS_WINDOW) {
      record.judgement = 'early_miss';
      this._onmiss();
    }

    // Don't increment currentIndex yet to account for big notes which are hit
    // in two inputs.
    if (!ho.isBig) {
      this._currentIndex += 1;
    }
  }

  /**
   * Handles the case where no input was made to a hit circle.
   * @param ho
   * @returns `true` if a hit circle was NOT judged, else `false`
   */
  private _judgeHitCircleByTime(ho: HitCircle) {
    const record = this._judgements[this._currentIndex] as HitCircleJudgement;

    // Move on to the next hitobject if a big hitcircle can no longer be hit
    // fully.
    if (
      ho.isBig &&
      record &&
      record.judgement !== null &&
      this._time - this._previousInputTime > 30
    ) {
      this._currentIndex += 1;
      return true;
    }

    if (this._time <= ho.time + OK_WINDOW) {
      return true;
    }

    // Don't judge already previously judged hit circles; this handles big hit
    // circles which do not increment currentIndex directly on the initial
    // input.
    if (record.judgement === null) {
      record.judgement = 'late_miss';
      this._onmiss();
    }

    this._currentIndex += 1;
    return false;
  }

  private _setInitialJudgements() {
    this._currentIndex = 0;

    if (!this._chartObjects) {
      return;
    }

    this._judgements = this._chartObjects.hitObjects.map(ho => {
      if (ho instanceof HitCircle) {
        return new HitCircleJudgement();
      } else if (ho instanceof Drumroll) {
        return new DrumrollJudgement();
      } else if (ho instanceof Balloon) {
        return new BalloonJudgement(ho.hitCount);
      }
    }) as HitObjectJudgement[];
  }

  private _updateJudgementsByTime() {
    if (!this._chartObjects) {
      return;
    }

    while (this._currentIndex < this._chartObjects.hitObjects.length) {
      const hitObject = this._chartObjects.hitObjects[this._currentIndex];

      let nothingJudgableYet = false;

      if (hitObject instanceof HitCircle) {
        nothingJudgableYet = this._judgeHitCircleByTime(hitObject);
      } else if (hitObject instanceof Drumroll) {
        nothingJudgableYet = this._judgeDrumrollByTime(hitObject);
      } else if (hitObject instanceof Balloon) {
        nothingJudgableYet = this._judgeBalloonByTime(hitObject);
      }

      if (nothingJudgableYet) {
        break;
      }
    }
  }

  judgeInput(input: GameInput) {
    if (!this._chartObjects) {
      return;
    }

    const hitObject = this._chartObjects.hitObjects[this._currentIndex];

    if (hitObject instanceof HitCircle) {
      this._judgeHitCircleByInput(hitObject, input);
    } else if (hitObject instanceof Drumroll) {
      this._judgeDrumrollByInput(hitObject, input);
    } else if (hitObject instanceof Balloon) {
      this._judgeBalloonByInput(hitObject, input);
    }

    this._previousInputTime = input.time;
  }

  resetTo(newTime: number) {
    this._time = newTime;
    this._previousInputTime = -Infinity;

    if (!this._chartObjects) {
      return;
    }

    // let lo = 0;
    // let hi = this._chartObjects.hitObjects.length - 1;

    // while (lo < hi) {
    //   const mid = Math.floor((lo + hi) / 2);

    //   if (this._chartObjects.hitObjects[mid].time + OK_WINDOW < this._time) {
    //     lo = mid + 1;
    //   } else {
    //     hi = mid;
    //   }
    // }

    // this._currentIndex = lo;

    for (const [i, ho] of this._chartObjects.hitObjects.entries()) {
      if (this._time <= ho.time + OK_WINDOW) {
        this._currentIndex = i;
        break;
      }
    }

    this._setInitialJudgements();
  }
}
