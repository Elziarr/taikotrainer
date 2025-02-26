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
  kiai: boolean;

  constructor(time: number, kiai: boolean) {
    super(time);

    this.kiai = kiai;
  }
}

export class TimingEvent extends BeatmapEvent {
  beatLength: number;
  beatsPerMeasure: number;

  constructor(time: number, beatLength: number, beatsPerMeasure: number) {
    super(time);

    this.beatLength = beatLength;
    this.beatsPerMeasure = beatsPerMeasure;
  }

  get measureLength() {
    return this.beatLength * this.beatsPerMeasure;
  }
}
