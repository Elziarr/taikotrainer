import type { ChartObjects } from '../chart/ChartObjects';
import { Drumroll, Balloon } from '../chart/hitobjects';
import { Clock } from './Clock.svelte';
import { AudioSettings } from './settings/audio.svelte';
import { GameplaySettings } from './settings/gameplay.svelte';

interface TimelineProps {
  onseek: (time: number) => void;
  ontick: (time: number) => void;
}

const SMOOTH_SEEK_FACTOR = 0.07;

export class Timeline {
  private _lerpClock: Clock;
  private _mainClock: Clock;

  private _audio: Howl | null = $state(null);
  private _boundToPlayAudio = false;
  private _chartObjects: ChartObjects | null = null;
  private _duration = $state(0);
  private _speedMultiplier = 1;
  private _startTime = $state(0);
  private _startTimestamp: number | null = $state(null);
  private _time = $state(0);
  private _timeToLerpTo = 0;

  private _onseek: TimelineProps['onseek'];
  private _ontick: TimelineProps['ontick'];

  private _startOffset = $derived(
    -Howler.ctx.baseLatency * 1000 + GameplaySettings.offset,
  );

  constructor({ onseek, ontick }: TimelineProps) {
    this._lerpClock = new Clock({ ontick: this._lerpTick });
    this._mainClock = new Clock({ ontick: this._tick });

    this._onseek = onseek;
    this._ontick = ontick;

    $effect(() => {
      this._audio?.volume(AudioSettings.musicVolume);
    });
  }

  private get _currentBeatLength() {
    if (!this._chartObjects) {
      return 0;
    }

    const currTimingEvtIndex = this._chartObjects.getActiveTimingEventIndex(
      this._time,
    );

    return this._chartObjects.timingEvents[currTimingEvtIndex].beatLength;
  }

  get audio() {
    return this._audio;
  }

  get chartObjects() {
    return this._chartObjects;
  }

  get duration() {
    return this._duration;
  }

  get isPlaying() {
    return this._mainClock.isRunning;
  }

  get speedMultiplier() {
    return this._speedMultiplier;
  }

  set speedMultiplier(v: number) {
    this._speedMultiplier = v;
    this._audio?.rate(this._speedMultiplier);
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

  /**
   * Assumes paused audio.
   * @param time
   */
  private _smoothSeek(time: number) {
    this._timeToLerpTo = time;

    if (!this._lerpClock.isRunning) {
      this._lerpClock.resume();
    }
  }

  private _lerpTick = (
    timestamp: DOMHighResTimeStamp,
    dt: DOMHighResTimeStamp,
  ) => {
    const vel = (this._timeToLerpTo - this._time) * SMOOTH_SEEK_FACTOR;

    this._time =
      vel > 0
        ? Math.min(this._time + vel * dt, this._timeToLerpTo)
        : Math.max(this._time + vel * dt, this._timeToLerpTo);

    if (this._time === this._timeToLerpTo) {
      this._lerpClock.pause();
    }

    this._onseek(this._time);
  };

  private _tick = (timestamp: DOMHighResTimeStamp, dt: DOMHighResTimeStamp) => {
    this._time = this._time + dt * this._speedMultiplier;
    this._startTimestamp = timestamp - this._time;

    // Time audio playback
    if (
      this._time >= this._startOffset &&
      this._audio &&
      this._boundToPlayAudio
    ) {
      this._audio?.once('play', () =>
        this._audio?.seek((this._time - this._startOffset) / 1000),
      );
      this._audio?.rate(this._speedMultiplier);
      this._audio?.play();

      this._boundToPlayAudio = false;
    }

    // Handle chart end
    if (this._time > this._duration) {
      this._time = this._duration;
      this.pause();
    }

    this._ontick(this._time);
  };

  forward(factor = 1) {
    const nextTime = Math.min(
      this._duration,
      this._time + this._currentBeatLength * factor,
    );

    if (!this.isPlaying) {
      this._smoothSeek(nextTime);
    } else {
      this.seek(nextTime);
    }
  }

  pause() {
    this._lerpClock.pause();

    this._mainClock.pause();
    this._audio?.pause();

    this._startTimestamp = null;
  }

  restart() {
    this.seek(this._startTime);
  }

  resume() {
    this._lerpClock.pause();

    if (!this._mainClock.isRunning && this._time >= this._duration) {
      this.restart();
    }

    this._mainClock.resume();
    this._boundToPlayAudio = true;
  }

  rewind(factor = 1) {
    const nextTime = Math.max(
      this._startTime,
      this._time - this._currentBeatLength * factor,
    );

    if (!this.isPlaying) {
      this._smoothSeek(nextTime);
    } else {
      this.seek(nextTime);
    }
  }

  seek(time: number) {
    this._lerpClock.pause();

    this._time = time;
    this._audio?.seek((this._time - this._startOffset) / 1000);

    if (this._time < 0) {
      this._audio?.stop();
      this._boundToPlayAudio = true;
    }

    this._onseek(this._time);
  }

  setChart(chartObjects: ChartObjects | null, chartAudio: Howl | null) {
    this._chartObjects = chartObjects;

    this._audio?.unload();
    this._audio = chartAudio;

    if (!this._chartObjects) {
      this._duration = 0;
      this._startTime = 0;

      this.pause();
      this.restart();
      return;
    }

    const startOffsetLength =
      this._chartObjects.timingEvents[0].measureLength || 0;
    this._startTime = -startOffsetLength;

    const lastHitObject = this._chartObjects.hitObjects.at(-1)!;
    const lastHitTime =
      lastHitObject instanceof Balloon || lastHitObject instanceof Drumroll
        ? lastHitObject.endTime
        : lastHitObject.time;

    this._duration = Math.min(
      lastHitTime + startOffsetLength,
      this._audio!.duration() * 1000,
    );

    this.pause();
    this.restart();
  }
}
