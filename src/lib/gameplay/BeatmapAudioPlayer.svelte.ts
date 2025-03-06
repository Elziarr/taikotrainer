export class BeatmapAudioPlayer {
  private _boundToPlay = false;

  private _audio = $state<Howl | null>(null);
  private _time = $state(0);

  get audio() {
    return this._audio;
  }

  set audio(v: Howl | null) {
    this._audio?.unload();
    this._audio = v;
  }

  get time() {
    return this._time;
  }

  set time(v: number) {
    this._time = v;

    if (this._time > 0 && this._audio && this._boundToPlay) {
      this._audio?.once('play', () => {
        this._audio?.seek(this._time / 1000);
      });
      this._audio?.play();
      this._boundToPlay = false;
    }
  }

  pause() {
    this._audio?.pause();
  }

  resume() {
    this._boundToPlay = true;
  }

  seek(nextTime: number) {
    this._time = nextTime;
    this._audio?.seek(nextTime / 1000);

    if (nextTime < 0) {
      this._audio?.stop();
      this._boundToPlay = true;
    }
  }
}
