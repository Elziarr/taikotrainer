import type {
  BeatmapEvent,
  DifficultyEvent,
  KiaiTimeEvent,
  TimingEvent,
} from './events';
import { Balloon, Drumroll, HitCircle, type HitObject } from './hitobjects';
import type { ChartDiff } from './metadata';

type ChartObjectsParams = {
  diff: ChartDiff;
  hitObjects: HitObject[];
  difficultyEvents: DifficultyEvent[];
  timingEvents: TimingEvent[];
  kiaiTimeEvents: KiaiTimeEvent[];
};

export class ChartObjects {
  diff: ChartDiff;

  hitObjects: HitObject[];
  difficultyEvents: DifficultyEvent[];
  timingEvents: TimingEvent[];
  kiaiTimeEvents: KiaiTimeEvent[];

  constructor(params: ChartObjectsParams) {
    this.diff = params.diff;

    this.hitObjects = params.hitObjects;
    this.difficultyEvents = params.difficultyEvents;
    this.timingEvents = params.timingEvents;
    this.kiaiTimeEvents = params.kiaiTimeEvents;
  }

  private _getActiveEventIndex(events: BeatmapEvent[], time: number) {
    if (events.length === 1 || time < events[0].time) {
      return 0;
    }

    for (let i = 1; i < events.length; i++) {
      const currObj = events[i];
      const prevObj = events[i - 1];

      if (time >= prevObj.time && time < currObj.time) {
        return i - 1;
      }
    }

    // Time is after last event:
    return events.length - 1;
  }

  getActiveDifficultyEventIndex(time: number) {
    return this._getActiveEventIndex(this.difficultyEvents, time);
  }

  getActiveTimingEventIndex(time: number) {
    return this._getActiveEventIndex(this.timingEvents, time);
  }

  getDuration(audioDuration: number) {
    const lastHitObj = this.hitObjects.at(-1);

    let lastHitObjTime = Infinity;

    if (lastHitObj instanceof HitCircle) {
      lastHitObjTime = lastHitObj.time;
    } else if (
      lastHitObj instanceof Drumroll ||
      lastHitObj instanceof Balloon
    ) {
      lastHitObjTime = lastHitObj.endTime;
    }

    const margin = this.timingEvents.at(-1)!.measureLength;
    return Math.min(lastHitObjTime + margin, audioDuration);
  }

  getVelocityFactor(time: number) {
    const diffEvt =
      this.difficultyEvents[this.getActiveDifficultyEventIndex(time)];
    const timingEvt = this.timingEvents[this.getActiveTimingEventIndex(time)];

    return diffEvt.scrollRate / timingEvt.measureLength;
  }
}
