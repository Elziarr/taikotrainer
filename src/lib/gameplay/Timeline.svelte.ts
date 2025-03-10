import type { ChartObjects } from '../chart/ChartObjects';

export class Timeline {
  private _prevTimestamp: DOMHighResTimeStamp = 0;
  private _loopId: number | null = null;
  private _playbackDone = false;

  private _chartObjects: ChartObjects | null = null;
  private _chartDuration = $state(0);
  private _isPlaying = $state(false);
  private _startTime = $state(0);
  private _startTimestamp = $state(0);
  private _time = $state(0);

  private _speedMultiplier = 1;

  private _ontick: (time: number) => void;
  private _onseek: (nextTime: number) => void;

  constructor(ontick: Timeline['_ontick'], onseek: Timeline['_onseek']) {
    this._ontick = ontick;
    this._onseek = onseek;
  }

  private get _currentMeasureLength() {
    if (!this._chartObjects) {
      return 0;
    }

    const currTimingEvtIndex = this._chartObjects.getActiveTimingEventIndex(
      this._time,
    );

    return this._chartObjects.timingEvents[currTimingEvtIndex].measureLength;
  }

  get chartObjects() {
    return this._chartObjects;
  }

  set chartObjects(v: ChartObjects | null) {
    this._chartObjects = v;

    if (!this._chartObjects) {
      return;
    }

    const startOffsetLength =
      this._chartObjects.timingEvents[0].measureLength || 0;
    this._startTime =
      this._chartObjects.hitObjects[0].time < startOffsetLength
        ? -startOffsetLength
        : 0;
    this._time = this._startTime;

    this.pause();
    this.restart();
  }

  get chartDuration() {
    return this._chartDuration;
  }

  set chartDuration(v: number) {
    this._chartDuration = v;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  get speedMultiplier() {
    return this._speedMultiplier;
  }

  set speedMultiplier(v: number) {
    this._speedMultiplier = v;
  }

  get startTime() {
    return this._startTime;
  }

  get startTimestamp() {
    return this._startTimestamp;
  }

  get time() {
    return this._time;
  }

  private _loop = () => {
    // Call performance.now() directly to consider time elapsed when the tab
    // is out of focus.
    const currTimestamp = performance.now();

    const dt = currTimestamp - this._prevTimestamp;
    this._prevTimestamp = currTimestamp;

    this._tick(dt * this._speedMultiplier);
    this._ontick(this._time);

    this._loopId = requestAnimationFrame(this._loop);
  };

  private _tick(dt: DOMHighResTimeStamp) {
    this._time = this._time + dt;

    if (this._time > this._chartDuration) {
      this._time = this._chartDuration;
      this.pause();
      this._playbackDone = true;
    }
  }

  forward(factor = 1) {
    const nextTime = Math.min(
      this._chartDuration,
      this._time + this._currentMeasureLength * factor,
    );
    this.seek(nextTime);
  }

  pause() {
    cancelAnimationFrame(this._loopId!);
    this._loopId = null;
    this._isPlaying = false;
  }

  resume() {
    if (this._playbackDone) {
      this._time = this._startTime;
      this._playbackDone = false;
    }

    this._prevTimestamp = performance.now();
    this._loopId = requestAnimationFrame(this._loop);
    this._isPlaying = true;

    this._startTimestamp = this._prevTimestamp - this._startTime;
  }

  restart() {
    this.seek(this._startTime);
    this._playbackDone = false;
  }

  rewind(factor = 1) {
    const nextTime = Math.max(
      this._startTime,
      this._time - this._currentMeasureLength * factor,
    );
    this.seek(nextTime);
  }

  seek(nextTime: number) {
    const dt = this._time - nextTime;

    this._time = nextTime;
    this._startTimestamp += dt;

    this._onseek(this._time);
  }
}
