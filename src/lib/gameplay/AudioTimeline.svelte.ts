import type { ChartObjects } from '../chart/ChartObjects';
import { Clock } from './Clock.svelte';
import { AudioSettings } from './settings/audio.svelte';
import { GameplaySettings } from './settings/gameplay.svelte';

interface TimelineProps {
  onseek: (time: number) => void;
  ontick: (time: number) => void;
}

export class Timeline {
  private _clock: Clock;

  private _audio: Howl | null = $state(null);
  private _boundToPlayAudio = false;
  private _chartObjects: ChartObjects | null = null;
  private _duration = $state(0);
  private _speedMultiplier = 1;
  private _startTime = $state(0);
  private _startTimestamp: number | null = $state(null);
  private _time = $state(0);

  private _onseek: TimelineProps['onseek'];
  private _ontick: TimelineProps['ontick'];

  private _startOffset = $derived(
    -Howler.ctx.baseLatency * 1000 + GameplaySettings.offset,
  );

  constructor({ onseek, ontick }: TimelineProps) {
    this._clock = new Clock({ ontick: this._tick });

    this._onseek = onseek;
    this._ontick = ontick;

    $effect(() => {
      this._audio?.volume(AudioSettings.musicVolume);
    });
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
    return this._clock.isRunning;
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
      this._time + this._currentMeasureLength * factor,
    );
    this.seek(nextTime);
  }

  pause() {
    this._clock.pause();
    this._audio?.pause();

    this._startTimestamp = null;
  }

  restart() {
    this.seek(this._startTime);
  }

  resume() {
    if (!this._clock.isRunning && this._time >= this._duration) {
      this.restart();
    }

    this._clock.resume();
    this._boundToPlayAudio = true;
  }

  rewind(factor = 1) {
    const nextTime = Math.max(
      this._startTime,
      this._time - this._currentMeasureLength * factor,
    );
    this.seek(nextTime);
  }

  seek(time: number) {
    this._time = time;
    this._audio?.seek((this._time - this._startOffset) / 1000);

    if (this._time < 0) {
      this._audio?.stop();
      this._boundToPlayAudio = true;
    }

    this._onseek(this._time);
  }

  setChart(chartObjects: ChartObjects, chartAudio: Howl) {
    this._chartObjects = chartObjects;

    this._audio?.unload();
    this._audio = chartAudio;

    const startOffsetLength =
      this._chartObjects.timingEvents[0].measureLength || 0;
    this._startTime = -startOffsetLength;

    this._duration = Math.min(
      this._chartObjects.hitObjects.at(-1)!.time + startOffsetLength,
      this._audio.duration() * 1000,
    );

    this.pause();
    this.restart();
  }
}
