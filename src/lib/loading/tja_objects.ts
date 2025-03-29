import { ChartObjects } from '../chart/ChartObjects';
import { DifficultyEvent, KiaiTimeEvent, TimingEvent } from '../chart/events';
import {
  Balloon,
  Drumroll,
  HitCircle,
  type HitObject,
} from '../chart/hitobjects';
import type { ChartDiff } from '../chart/metadata';
import TJAParser, {
  AdvancedBranchMarkerCommand,
  BPMChangeCommand,
  BranchMarkerCommand,
  Command,
  CommandType,
  Course,
  MeasureCommand,
  NormalBranchMarkerCommand,
  Note,
  NoteSequence,
  ScrollCommand,
  Song,
} from 'tja';

const DEFAULT_VEL_SCALE = 1.35;

export async function parseTjaChartObjects(diff: ChartDiff) {
  const chartText = await diff.file.text();
  const chart = TJAParser.parse(chartText);

  const course = chart.courses.find(
    course =>
      course.difficulty.toString() ===
      (diff.name === 'Inner Oni' ? 'Edit' : diff.name),
  )!;

  return new ChartObjects({
    diff,
    ...getBeatmapInfo(chart, course),
  });
}

function getBeatmapInfo(beatmap: Song, chosenCourse: Course) {
  const offset = -beatmap.offset * 1000;

  const hitObjects: HitObject[] = [];
  const difficultyEvents: DifficultyEvent[] = [
    new DifficultyEvent(offset, DEFAULT_VEL_SCALE),
  ];
  const timingEvents: TimingEvent[] = [
    new TimingEvent(offset, 60000 / beatmap.bpm, 4),
  ];
  const kiaiTimeEvents: KiaiTimeEvent[] = [];

  let currBpm = beatmap.bpm;
  let currTimeSigTop = 4;
  let currTimeSigBottom = 4;
  let currTime = offset;

  let lastKiaiStartTime = 0;
  let currSequence: Note[] = [];
  let currTimedCommands: (Command[] | null)[] = [];

  let balloonIndex = 0;
  let heldObjectState: 'balloon' | 'drumroll' | null = null;
  let heldObjectTime = 0;
  let heldObjectIsBig = false;

  let passthroughNotes = false;

  for (const cmd of chosenCourse.singleCourse.getCommands()) {
    switch (cmd.commandType) {
      case CommandType.NoteSequence:
        handleNoteSequence(cmd as NoteSequence);
        break;

      case CommandType.Measure:
        handleMeasure(cmd as MeasureCommand);
        break;

      case CommandType.BranchMarker:
        handleBranchMarker(cmd as BranchMarkerCommand);
        break;

      case CommandType.GoGoStart:
        handleGogoStart();
        break;

      case CommandType.GoGoEnd:
        handleGogoEnd();
        break;

      // Handle commands that can be applied in the middle of a sequence:
      default: {
        if (currSequence.length === currTimedCommands.length) {
          currTimedCommands.push([cmd]);
        } else {
          currTimedCommands.at(-1)!.push(cmd);
        }
      }
    }
  }

  function handleBPMChange(cmd: BPMChangeCommand) {
    currBpm = cmd.value;

    // I just guessed this, this probably needs to be based on the sequence
    // lengths somehow.
    timingEvents.push(
      new TimingEvent(
        currTime,
        (60000 / currBpm) * (currTimeSigBottom / currTimeSigTop),
        currTimeSigTop,
      ),
    );
  }

  // By default, only use the master branch notes if the map has branches.
  function handleBranchMarker(cmd: BranchMarkerCommand) {
    passthroughNotes =
      cmd instanceof NormalBranchMarkerCommand ||
      cmd instanceof AdvancedBranchMarkerCommand;
  }

  function handleGogoEnd() {
    kiaiTimeEvents.push(
      new KiaiTimeEvent(lastKiaiStartTime, currTime - lastKiaiStartTime),
    );
  }

  function handleGogoStart() {
    lastKiaiStartTime = currTime;
  }

  function handleMeasure(cmd: MeasureCommand) {
    currTimeSigTop = cmd.value.numerator;
    currTimeSigBottom = cmd.value.denominator;

    // I just guessed this, this probably needs to be based on the sequence
    // lengths somehow.
    timingEvents.push(
      new TimingEvent(
        currTime,
        (60000 / currBpm) * (currTimeSigBottom / currTimeSigTop),
        currTimeSigTop,
      ),
    );
  }

  function handleMeasureEnd() {
    for (let i = 0; i < currSequence.length; i++) {
      const note = currSequence[i];
      const modifiers = currTimedCommands[i];

      handleModifiers(modifiers);
      handleNote(note);

      const sequenceLength = Math.max(currSequence.length - 1, 1);
      const timePerNote =
        ((60000 / currBpm) * (currTimeSigTop / sequenceLength)) /
        (currTimeSigBottom / 4);

      // Also handle case where the only note in the sequence is a MeasureEnd, i.e.
      // skip a whole measure.
      if (!note.isMeasureEnd || currSequence.length === 1) {
        currTime += timePerNote;
      }
    }

    currSequence = [];
    currTimedCommands = [];
  }

  function handleModifiers(modifiers: Command[] | null) {
    if (!modifiers) {
      return;
    }

    for (const modifier of modifiers) {
      switch (modifier.commandType) {
        case CommandType.BPMChange:
          handleBPMChange(modifier as BPMChangeCommand);
          break;

        case CommandType.Scroll:
          handleScroll(modifier as ScrollCommand);
          break;
      }
    }
  }

  function handleNote(note: Note) {
    if (note.isBlank || note.isMeasureEnd) {
      return;
    }

    if (note.isDon || note.isKa || note.isBigDon || note.isBigKa) {
      hitObjects.push(
        new HitCircle(
          hitObjects.length,
          currTime,
          note.isKa || note.isBigKa,
          note.isBigDon || note.isBigKa,
        ),
      );
    } else if (note.isBalloon) {
      heldObjectState = 'balloon';
      heldObjectTime = currTime;
    } else if (note.isDrumroll) {
      heldObjectState = 'drumroll';
      heldObjectTime = currTime;
      heldObjectIsBig = false;
    } else if (note.isBigDrumroll) {
      heldObjectState = 'drumroll';
      heldObjectTime = currTime;
      heldObjectIsBig = true;
    } else if (note.isEndOfDrumroll) {
      if (heldObjectState === 'drumroll') {
        hitObjects.push(
          new Drumroll(
            hitObjects.length,
            heldObjectTime,
            currTime - heldObjectTime,
            heldObjectIsBig,
          ),
        );
      } else if (heldObjectState === 'balloon') {
        hitObjects.push(
          new Balloon(
            hitObjects.length,
            heldObjectTime,
            currTime - heldObjectTime,
            chosenCourse.singleCourse.balloonCounts[balloonIndex],
          ),
        );
        balloonIndex += 1;
      }

      heldObjectState = null;
    }
  }

  function handleNoteSequence(sequence: NoteSequence) {
    if (passthroughNotes) {
      return;
    }

    const priorLength = currSequence.length;

    for (const [i, note] of sequence.notes.entries()) {
      if (!currTimedCommands[i + priorLength]) {
        currTimedCommands[i + priorLength] = null;
      }

      currSequence.push(note);

      if (note.isMeasureEnd) {
        handleMeasureEnd();
      }
    }
  }

  function handleScroll(cmd: ScrollCommand) {
    difficultyEvents.push(
      new DifficultyEvent(currTime, cmd.value * DEFAULT_VEL_SCALE),
    );
  }

  return {
    hitObjects,
    difficultyEvents,
    timingEvents,
    kiaiTimeEvents,
  };
}
