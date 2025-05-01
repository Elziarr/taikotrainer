import type { ChartObjects } from '../chart/ChartObjects';
import type { TimingEvent } from '../chart/events';
import { BASE_HEIGHT, BASE_WIDTH } from './Playfield';
import { AlphaFilter, Container, Graphics, GraphicsContext } from 'pixi.js';

const CHECKPOINT_LINE_TRIANGLE_SIZE = 12;
const LINE_CTX = new GraphicsContext()
  .lineTo(0, 1)
  .stroke({ width: 2, color: 0x999999 });
const LINE_END_TIME_MARGIN = 5000;
const LINE_START_TIME_MARGIN = 12000;

export class LineRenderer extends Container {
  private _playfieldHeight = BASE_HEIGHT;
  private _checkpointLineContext = new GraphicsContext();

  private _chartObjects: ChartObjects | null = null;
  private _checkpointTime: number | null = null;
  private _constantDensity = false;
  private _duration = 0;
  private _densityMultiplier = 1;
  private _leftMargin = 0;
  private _playfieldWidth = BASE_WIDTH;
  private _time = 0;

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

  private _getStartingLineTime(timingEvt: TimingEvent) {
    // Depending on how tight the lines will end up being displayed, offset
    // backwards from the line nearest to the current time so that the other
    // lines that should be displayed before the present line are also displayed.
    const priorVelocity = this._getVelocity(
      this._time - timingEvt.measureLength,
    );
    const compensationOffset =
      LINE_START_TIME_MARGIN / (priorVelocity * timingEvt.measureLength);

    const nearestPriorLineTime = nearestPriorMultiple(
      timingEvt.measureLength,
      timingEvt.lineStartTime,
      this._time - compensationOffset,
    );
    return Math.max(nearestPriorLineTime, timingEvt.lineStartTime);
  }

  private _render() {
    this.removeChildren();

    if (!this._chartObjects) {
      return;
    }

    this._renderCheckpointLine();

    for (const [i, timingEvt] of this._chartObjects.timingEvents.entries()) {
      const timingEvtEndTime =
        this._chartObjects.timingEvents[i + 1]?.time ?? this._duration;

      let lineTime = this._getStartingLineTime(timingEvt);

      // Use floor(time) as a basis since otherwise some lines will be redundant.
      while (Math.floor(lineTime) < Math.floor(timingEvtEndTime)) {
        if (!timingEvt.linesVisibleAt(lineTime)) {
          lineTime += timingEvt.measureLength;
          continue;
        }

        const vel = this._getVelocity(lineTime);
        const lineX = vel * (lineTime - this._time) + this._leftMargin;

        // Rendering outside of the playfield bounds needs to be allowed because
        // of velocity changes making succeeding lines in-screen despite previous
        // lines already being out of the screen.
        if (lineX >= 0 && lineX <= this._playfieldWidth) {
          const lineSprite = new Graphics(LINE_CTX);
          lineSprite.x = lineX;
          lineSprite.scale.y = this._playfieldHeight;

          this.addChild(lineSprite);
        }

        // Only stop rendering lines if it can be assumed that there will be no
        // velocity changes in the near future since these velocity changes can
        // make succeeding lines in-screen despite previous lines already being
        // out of the screen.
        else if (
          lineX > this._playfieldWidth &&
          vel ===
            this._getVelocity(
              this._time +
                LINE_END_TIME_MARGIN / (vel * timingEvt.measureLength),
            )
        ) {
          break;
        }

        lineTime += timingEvt.measureLength;
      }
    }
  }

  private _renderCheckpointLine() {
    if (this._checkpointTime === null) {
      return;
    }

    const vel = this._getVelocity(this._checkpointTime);
    const lineX = vel * (this._checkpointTime - this._time) + this._leftMargin;

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

  updateDuration(newDuration: number) {
    this._duration = newDuration;
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
