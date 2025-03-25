interface ClockProps {
  ontick: (timestamp: number, dt: number) => void;
}

export class Clock {
  private _loopId: number | null = $state(null);
  private _prevTimestamp = 0;

  private _ontick: ClockProps['ontick'];

  readonly isRunning = $derived(this._loopId !== null);

  constructor({ ontick }: ClockProps) {
    this._ontick = ontick;
  }

  private _loop = () => {
    // Call performance.now() directly to consider time elapsed when the tab
    // is out of focus.
    const currTimestamp = performance.now();

    const dt = currTimestamp - this._prevTimestamp;
    this._prevTimestamp = currTimestamp;

    this._ontick(currTimestamp, dt);

    if (this._loopId !== null) {
      this._loopId = requestAnimationFrame(this._loop);
    }
  };

  pause() {
    cancelAnimationFrame(this._loopId!);
    this._loopId = null;
  }

  resume() {
    this._prevTimestamp = performance.now();
    this._loopId = requestAnimationFrame(this._loop);
  }
}
