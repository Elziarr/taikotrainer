import { ChartObjects } from '../chart/ChartObjects';
import { DifficultyEvent, KiaiTimeEvent, TimingEvent } from '../chart/events';
import {
  Balloon,
  Drumroll,
  HitCircle,
  type HitObject,
} from '../chart/hitobjects';
import type { ChartDiff } from '../chart/metadata';
import {
  BPMChangeCommand,
  CommandType,
  Course,
  DelayCommand,
  MeasureCommand,
  MeasureValue,
  Note,
  NoteSequence,
  ScrollCommand,
  Song,
} from 'tja';

type HeldObjectState =
  | { type: 'drumroll'; startTime: number; isBig: boolean }
  | { type: 'balloon'; startTime: number };
type ParseState = 'neutral' | 'branchfinding' | 'endfinding' | 'noteparsing';

const DEFAULT_VEL_SCALE = 0.33;

export class TJACourseReader {
  private _chart: Song;
  private _course: Course;

  private _difficultyEvents: DifficultyEvent[] = [];
  private _hitObjects: HitObject[] = [];
  private _kiaiTimeEvents: KiaiTimeEvent[] = [];
  private _timingEvents: TimingEvent[] = [];

  private _balloonIndex = 0;
  private _bpm = 120;
  private _i = 0;
  private _heldObjectState: HeldObjectState | null = null;
  private _lastHandledCommandIndex = 0;
  private _lastHandledTimingEventIndex: number | null = null;
  private _lastKiaiStartTime = 0;
  private _linesOff = false;
  private _parseState = 'neutral' as ParseState;
  private _sequenceNoteCount = 0;
  private _time = 0;
  private _timeSignature = new MeasureValue(4, 4);

  constructor(chart: Song, course: Course) {
    this._chart = chart;
    this._course = course;

    const offset = -this._chart.offset * 1000;
    const beatLength = 60000 / this._chart.bpm;

    this._bpm = this._chart.bpm;
    this._time = offset;

    this._difficultyEvents.push(new DifficultyEvent(offset, DEFAULT_VEL_SCALE));
    this._timingEvents.push(
      new TimingEvent(offset, beatLength, beatLength * 4, beatLength),
    );
  }

  private _handleBarLineOff() {
    if (
      this._parseState === 'branchfinding' ||
      this._parseState === 'endfinding'
    ) {
      this._i += 1;
      return;
    }

    this._linesOff = true;

    const currTimingEvt = this._timingEvents[this._timingEvents.length - 1];
    currTimingEvt.visibilityPoints.push({
      hideTime: this._time,
      showTime: Infinity,
    });

    this._i += 1;
    this._lastHandledCommandIndex = this._i;
  }

  private _handleBarLineOn() {
    if (
      this._parseState === 'branchfinding' ||
      this._parseState === 'endfinding'
    ) {
      this._i += 1;
      return;
    }

    this._linesOff = false;

    const currTimingEvt = this._timingEvents[this._timingEvents.length - 1];
    if (currTimingEvt.visibilityPoints.length === 0) {
      currTimingEvt.visibilityPoints.push({
        hideTime: -Infinity,
        showTime: this._time,
      });
    } else {
      currTimingEvt.visibilityPoints.at(-1)!.showTime = this._time;
    }

    this._i += 1;
    this._lastHandledCommandIndex = this._i;
  }

  private _handleBPMChange(cmd: BPMChangeCommand) {
    if (
      this._parseState === 'branchfinding' ||
      this._parseState === 'endfinding'
    ) {
      this._i += 1;
      return;
    }

    this._bpm = cmd.value;

    const beatLength = 240000 / (this._bpm * this._timeSignature.denominator);
    const measureLength = (240000 * this._timeSignature.fraction) / this._bpm;

    if (this._timingEvents.at(-1)?.time === this._time) {
      const timingEvt = this._timingEvents.at(-1)!;
      timingEvt.beatLength = beatLength;
      timingEvt.measureLength = measureLength;
      timingEvt.timingLength = 60000 / this._bpm;
    } else {
      this._timingEvents.push(
        new TimingEvent(
          this._time,
          beatLength,
          measureLength,
          60000 / this._bpm,
        ),
      );
    }

    if (
      this._parseState === 'noteparsing' &&
      this._lastHandledTimingEventIndex === null
    ) {
      this._lastHandledTimingEventIndex = this._timingEvents.length - 1;
    }

    if (this._linesOff) {
      const currTimingEvt = this._timingEvents[this._timingEvents.length - 1];
      currTimingEvt.visibilityPoints.push({
        hideTime: this._time,
        showTime: Infinity,
      });
    }

    this._i += 1;
    this._lastHandledCommandIndex = this._i;
  }

  private _handleBranchEnd() {
    if (this._parseState !== 'branchfinding') {
      this._i += 1;
      this._lastHandledCommandIndex = this._i;
      return;
    }

    this._parseState = 'neutral';
    this._i = this._lastHandledCommandIndex;
  }

  private _handleBranchMarker() {
    this._lastHandledCommandIndex = this._i;
    this._i += 1;
  }

  private _handleBranchStart() {
    this._parseState = 'branchfinding';

    this._i += 1;
    this._lastHandledCommandIndex = this._i;
  }

  private _handleDelay(cmd: DelayCommand) {
    if (
      this._parseState === 'branchfinding' ||
      this._parseState === 'endfinding'
    ) {
      this._i += 1;
      return;
    }

    this._time += cmd.value * 1000;

    this._i += 1;
    this._lastHandledCommandIndex = this._i;
  }

  private _handleGoGoEnd() {
    if (
      this._parseState === 'branchfinding' ||
      this._parseState === 'endfinding'
    ) {
      this._i += 1;
      return;
    }

    this._kiaiTimeEvents.push(
      new KiaiTimeEvent(
        this._lastKiaiStartTime,
        this._time - this._lastKiaiStartTime,
      ),
    );

    this._i += 1;
    this._lastHandledCommandIndex = this._i;
  }

  private _handleGoGoStart() {
    if (
      this._parseState === 'branchfinding' ||
      this._parseState === 'endfinding'
    ) {
      this._i += 1;
      return;
    }

    this._lastKiaiStartTime = this._time;

    this._i += 1;
    this._lastHandledCommandIndex = this._i;
  }

  private _handleMeasure(cmd: MeasureCommand) {
    if (
      this._parseState === 'branchfinding' ||
      this._parseState === 'endfinding'
    ) {
      this._i += 1;
      return;
    }

    this._timeSignature = cmd.value;

    const beatLength = 240000 / (this._bpm * this._timeSignature.denominator);
    const measureLength = (240000 * this._timeSignature.fraction) / this._bpm;

    if (this._timingEvents.at(-1)?.time === this._time) {
      const timingEvt = this._timingEvents.at(-1)!;
      timingEvt.beatLength = beatLength;
      timingEvt.measureLength = measureLength;
    } else {
      this._timingEvents.push(
        new TimingEvent(
          this._time,
          beatLength,
          measureLength,
          60000 / this._bpm,
        ),
      );
    }

    if (
      this._parseState === 'noteparsing' &&
      this._lastHandledTimingEventIndex === null
    ) {
      this._lastHandledTimingEventIndex = this._timingEvents.length - 1;
    }

    if (this._linesOff) {
      const currTimingEvt = this._timingEvents[this._timingEvents.length - 1];
      currTimingEvt.visibilityPoints.push({
        hideTime: this._time,
        showTime: Infinity,
      });
    }

    this._i += 1;
    this._lastHandledCommandIndex = this._i;
  }

  private _handleNoteSequence(cmd: NoteSequence) {
    if (this._parseState === 'branchfinding') {
      this._i += 1;
      return;
    }

    if (this._parseState !== 'noteparsing') {
      if (cmd.notes.at(-1)?.isMeasureEnd) {
        this._sequenceNoteCount += cmd.notes.length - 1;
        this._parseState = 'noteparsing';

        if (this._i !== this._lastHandledCommandIndex) {
          this._i = this._lastHandledCommandIndex;
          return;
        }
      } else {
        this._sequenceNoteCount += cmd.notes.length;
        this._parseState = 'endfinding';

        this._i += 1;
        return;
      }
    }

    const measureLength = this._timingEvents.at(-1)!.measureLength;
    const dt = measureLength / Math.max(1, this._sequenceNoteCount);

    for (const note of cmd.notes) {
      if (note.isMeasureEnd) {
        this._time = cmd.notes.length === 1 ? this._time + dt : this._time;
        continue;
      }

      if (note.isBlank) {
        this._time += dt;
        continue;
      }

      this._handlePlayableNote(note);
      this._time += dt;
    }

    if (cmd.notes.at(-1)?.isMeasureEnd) {
      this._sequenceNoteCount = 0;
      this._parseState = 'neutral';

      if (this._lastHandledTimingEventIndex !== null) {
        this._timingEvents
          .slice(this._lastHandledTimingEventIndex)
          .forEach(timingEvt => {
            timingEvt.lineStartTime = this._time;
          });

        this._lastHandledTimingEventIndex = null;
      }
    }

    this._i += 1;
    this._lastHandledCommandIndex = this._i;
  }

  private _handlePlayableNote(note: Note) {
    if (note.isDon || note.isKa || note.isBigDon || note.isBigKa) {
      this._hitObjects.push(
        new HitCircle(
          this._hitObjects.length,
          this._time,
          note.isKa || note.isBigKa,
          note.isBigDon || note.isBigKa,
        ),
      );
      return;
    }

    if (note.isBalloon) {
      this._heldObjectState = { type: 'balloon', startTime: this._time };
      return;
    }

    if (note.isDrumroll) {
      this._heldObjectState = {
        type: 'drumroll',
        startTime: this._time,
        isBig: false,
      };
      return;
    }

    if (note.isBigDrumroll) {
      this._heldObjectState = {
        type: 'drumroll',
        startTime: this._time,
        isBig: true,
      };
      return;
    }

    if (note.isEndOfDrumroll) {
      if (this._heldObjectState === null) {
        throw new Error('Balloon/drumroll ended without starting one.');
      }

      if (this._heldObjectState.type === 'drumroll') {
        this._hitObjects.push(
          new Drumroll(
            this._hitObjects.length,
            this._heldObjectState.startTime,
            this._time - this._heldObjectState.startTime,
            this._heldObjectState.isBig,
          ),
        );
      } else if (this._heldObjectState.type === 'balloon') {
        this._hitObjects.push(
          new Balloon(
            this._hitObjects.length,
            this._heldObjectState.startTime,
            this._time - this._heldObjectState.startTime,
            this._course.singleCourse.balloonCounts[this._balloonIndex],
          ),
        );
        this._balloonIndex += 1;
      }

      this._heldObjectState = null;
      return;
    }
  }

  private _handleScroll(cmd: ScrollCommand) {
    if (
      this._parseState === 'branchfinding' ||
      this._parseState === 'endfinding'
    ) {
      this._i += 1;
      return;
    }

    this._difficultyEvents.push(
      new DifficultyEvent(this._time, cmd.value * DEFAULT_VEL_SCALE),
    );

    this._i += 1;
    this._lastHandledCommandIndex = this._i;
  }

  private _readChartInfo() {
    const commands = this._course.singleCourse.getCommands();

    while (this._i < commands.length) {
      this._readNextCommand();
    }
  }

  private _readNextCommand() {
    const cmd = this._course.singleCourse.getCommands()[this._i];

    switch (cmd.commandType) {
      case CommandType.BarLineOff:
        this._handleBarLineOff();
        break;

      case CommandType.BarLineOn:
        this._handleBarLineOn();
        break;

      case CommandType.BPMChange:
        this._handleBPMChange(cmd as BPMChangeCommand);
        break;

      // Default behavior for branches: use the latest branch (usually the
      // hardest?), ignore the rest.
      case CommandType.BranchEnd:
      case CommandType.Section:
        this._handleBranchEnd();
        break;

      case CommandType.BranchMarker:
        this._handleBranchMarker();
        break;

      case CommandType.BranchStart:
        this._handleBranchStart();
        break;

      case CommandType.Delay:
        this._handleDelay(cmd as DelayCommand);
        break;

      case CommandType.GoGoEnd:
        this._handleGoGoEnd();
        break;

      case CommandType.GoGoStart:
        this._handleGoGoStart();
        break;

      case CommandType.Measure:
        this._handleMeasure(cmd as MeasureCommand);
        break;

      case CommandType.NoteSequence:
        this._handleNoteSequence(cmd as NoteSequence);
        break;

      case CommandType.Scroll:
        this._handleScroll(cmd as ScrollCommand);
        break;

      default: {
        this._i += 1;

        if (
          this._parseState !== 'branchfinding' &&
          this._parseState !== 'endfinding'
        ) {
          this._lastHandledCommandIndex = this._i;
        }
      }
    }
  }

  read(diff: ChartDiff) {
    this._readChartInfo();

    return new ChartObjects({
      diff,
      difficultyEvents: this._difficultyEvents,
      hitObjects: this._hitObjects,
      kiaiTimeEvents: this._kiaiTimeEvents,
      timingEvents: this._timingEvents,
    });
  }
}
