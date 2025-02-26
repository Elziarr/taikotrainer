export abstract class HitObject {
  private _index: number;
  time: number;

  constructor(index: number, time: number) {
    this._index = index;
    this.time = time;
  }

  get index() {
    return this._index;
  }
}

export class Balloon extends HitObject {
  duration: number;
  hitCount: number;

  constructor(index: number, time: number, duration: number, hitCount: number) {
    super(index, time);

    this.duration = duration;
    this.hitCount = hitCount;
  }

  get endTime() {
    return this.time + this.duration;
  }
}

export class Drumroll extends HitObject {
  duration: number;
  isBig: boolean;

  constructor(index: number, time: number, duration: number, isBig: boolean) {
    super(index, time);

    this.duration = duration;
    this.isBig = isBig;
  }

  get endTime() {
    return this.time + this.duration;
  }
}

export class HitCircle extends HitObject {
  isKa: boolean;
  isBig: boolean;

  constructor(index: number, time: number, isKa: boolean, isBig: boolean) {
    super(index, time);

    this.isKa = isKa;
    this.isBig = isBig;
  }
}
