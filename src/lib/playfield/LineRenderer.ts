import type { ChartObjects } from '../chart/ChartObjects';
import { BASE_HEIGHT, BASE_WIDTH } from './Playfield';
import { AlphaFilter, Container, Graphics, GraphicsContext } from 'pixi.js';

const CHECKPOINT_LINE_TRIANGLE_SIZE = 12;
const LINE_CTX = new GraphicsContext()
  .lineTo(0, 1)
  .stroke({ width: 1.5, color: 0xffffff });

export class LineRenderer extends Container {
  private _playfieldHeight = BASE_HEIGHT;
  private _checkpointLineContext = new GraphicsContext();

  private _chartObjects: ChartObjects | null = null;
  private _checkpointTime: number | null = null;
  private _constantDensity = false;
  private _densityMultiplier = 1;
  private _leftMargin = 0;
  private _playfieldWidth = BASE_WIDTH;
  private _time = 0;

  private _getAssumedLineX(lineAtTime: number) {
    return (
      this._getVelocity(lineAtTime) * (lineAtTime - this._time) +
      this._leftMargin
    );
  }

  private _getEarliestMeasureLineTime(timingEvtIndex: number) {
    const timingEvt = this._chartObjects!.timingEvents[timingEvtIndex];

    const priorMeasureLineTime = nearestPriorMultiple(
      timingEvt.measureLength,
      timingEvt.time,
      this._time,
    );

    return Math.max(priorMeasureLineTime, timingEvt.time);
  }

  private _getVelocity(time: number) {
    if (!this._chartObjects) {
      return 0;
    }

    // TODO: Unify with velocity method in HitObject renderer
    return (
      BASE_WIDTH *
      this._chartObjects.getVelocityFactor(this._constantDensity ? 0 : time) *
      this._densityMultiplier
    );
  }

  private *_getVisibleLines() {
    // Go through each timing event instead of starting from the current one
    // since it's easier to work with weird SV quirks this way.
    for (const evtIndex of this._chartObjects!.timingEvents.keys()) {
      if (this._timingEventNotInDisplayBounds(evtIndex)) {
        continue;
      }

      const startLineTime = this._getEarliestMeasureLineTime(evtIndex);
      yield* this._getVisibleLinesForTimingEvent(evtIndex, startLineTime);
    }
  }

  private *_getVisibleLinesForTimingEvent(
    timingEvtIndex: number,
    startLineTime: number,
  ) {
    const currTimingEvt = this._chartObjects!.timingEvents[timingEvtIndex];

    const nextTimingEvtIndex = timingEvtIndex + 1;
    const nextTimingEvt = this._chartObjects!.timingEvents[nextTimingEvtIndex];

    let currLineTime = startLineTime;

    while (
      currLineTime - startLineTime <
      currTimingEvt.measureLength * currTimingEvt.beatsPerMeasure
    ) {
      const roundedTime = Math.floor(currLineTime);

      if (nextTimingEvt && roundedTime >= Math.floor(nextTimingEvt.time)) {
        break;
      }

      yield {
        time: roundedTime,
        velocity: this._getVelocity(currLineTime),
      };

      currLineTime += currTimingEvt.measureLength;
    }
  }

  private _render() {
    this.removeChildren();

    if (!this._chartObjects) {
      return;
    }

    this._renderCheckpointLine();

    for (const { time: lineTime, velocity } of this._getVisibleLines()) {
      const lineSprite = new Graphics(LINE_CTX);
      lineSprite.x = velocity * (lineTime - this._time) + this._leftMargin;
      lineSprite.scale.y = this._playfieldHeight;

      this.addChild(lineSprite);
    }
  }

  private _renderCheckpointLine() {
    if (this._checkpointTime === null) {
      return;
    }

    const lineX = this._getAssumedLineX(this._checkpointTime);

    if (lineX < 0 || lineX >= this._playfieldWidth) {
      return;
    }

    const checkpointLine = new Graphics({
      context: this._checkpointLineContext,
      filters: [new AlphaFilter({ alpha: 0.8 })],
      x: lineX,
    });
    this.addChild(checkpointLine);
  }

  private _timingEventNotInDisplayBounds(timingEvtIndex: number) {
    const timingEvt = this._chartObjects!.timingEvents[timingEvtIndex];

    // If the event start is still offscreen to the right:
    if (this._getAssumedLineX(timingEvt.time) > this._playfieldWidth) {
      return true;
    }

    const nextEvtIndex = timingEvtIndex + 1;

    // If the event is the last event:
    if (nextEvtIndex === this._chartObjects!.timingEvents.length) {
      return false;
    }

    // If the next event's start is already offscreen to the left:
    const nextEvt = this._chartObjects!.timingEvents[nextEvtIndex];
    return this._getAssumedLineX(nextEvt.time) < 0;
  }

  setLeftMargin(leftMargin: number) {
    this._leftMargin = leftMargin;
  }

  setPlayfieldHeight(playfieldHeight: number) {
    this._playfieldHeight = playfieldHeight;

    this._checkpointLineContext
      .clear()
      .lineTo(0, this._playfieldHeight / 2 - CHECKPOINT_LINE_TRIANGLE_SIZE)
      .lineTo(CHECKPOINT_LINE_TRIANGLE_SIZE, this._playfieldHeight / 2)
      .lineTo(0, this._playfieldHeight / 2 + CHECKPOINT_LINE_TRIANGLE_SIZE)
      .lineTo(0, this._playfieldHeight / 2 - CHECKPOINT_LINE_TRIANGLE_SIZE)
      .lineTo(0, this._playfieldHeight)
      .stroke({ width: 5, color: 0xed6bff, join: 'round' })
      .fill(0xed6bff);
  }

  updateChartObjects(newChartObjects: ChartObjects | null) {
    this._chartObjects = newChartObjects;
    this._render();

    console.log(newChartObjects);
  }

  updateCheckpointTime(newCheckpointTime: number | null) {
    this._checkpointTime = newCheckpointTime;
    this._render();
  }

  updateConstantDensity(newConstantDensity: boolean) {
    this._constantDensity = newConstantDensity;
    this._render();
  }

  updateDensityMultiplier(newDensityMultiplier: number) {
    this._densityMultiplier = newDensityMultiplier;
    this._render();
  }

  updateTime(newTime: number) {
    this._time = newTime;
    this._render();
  }

  updatePlayfieldWidth(newWidth: number) {
    this._playfieldWidth = newWidth;
    this._render();
  }
}

function nearestPriorMultiple(multiple: number, start: number, value: number) {
  return Math.floor((value - start) / multiple) * multiple + start;
}
