export abstract class BeatmapEvent {
  time: number;

  constructor(time: number) {
    this.time = time;
  }
}

export class DifficultyEvent extends BeatmapEvent {
  scrollRate: number;

  constructor(time: number, sliderVelocity: number) {
    super(time);

    this.scrollRate = sliderVelocity;
  }
}

export class KiaiTimeEvent extends BeatmapEvent {
  duration: number;

  constructor(time: number, duration: number) {
    super(time);

    this.duration = duration;
  }
}

export class TimingEvent extends BeatmapEvent {
  /**
   * Time length of a musical beat.
   */
  beatLength: number;
  /**
   * Time length of a musical measure
   */
  measureLength: number;
  /**
   * Time length acting as a basis for how fast notes/lines scroll
   */
  timingLength: number;
  visibilityPoints: { hideTime: number; showTime: number }[];

  constructor(
    time: number,
    beatLength: number,
    measureLength: number,
    timingLength: number,
  ) {
    super(time);

    this.beatLength = beatLength;
    this.measureLength = measureLength;
    this.timingLength = timingLength;
    this.visibilityPoints = [];
  }

  linesVisibleAt(time: number) {
    for (const [i, { hideTime, showTime }] of this.visibilityPoints.entries()) {
      if (time >= showTime && time < this.visibilityPoints[i + 1]?.hideTime) {
        return true;
      }

      if (time >= hideTime && time < showTime) {
        return false;
      }
    }

    return true;
  }
}
