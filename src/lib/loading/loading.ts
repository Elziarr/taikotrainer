import type { ChartDiff } from '../chart/metadata';
import { decodeAudioFile } from './audio_decoding';
import { getFileExtension, readFileAsArrayBuffer } from './file_util';
import { loadOsuChartMetadata } from './osu_info';
import { parseOsuChartObjects } from './osu_objects';
import { loadTjaChartMetadata } from './tja_info';
import { parseTjaChartObjects } from './tja_objects';
import type { ChartFiles } from './uploading';
import { Howl } from 'howler';

export async function loadChartMetadata(chartFiles: ChartFiles) {
  const type = getFileExtension(chartFiles.diffs[0]);

  if (type === 'osu') {
    return await loadOsuChartMetadata(chartFiles);
  } else if (type === 'tja') {
    return await loadTjaChartMetadata(chartFiles);
  }

  throw new Error('Invalid chart files.');
}

export async function loadChartObjects(diff: ChartDiff) {
  const type = getFileExtension(diff.file);

  if (type === 'osu') {
    return await parseOsuChartObjects(diff);
  } else if (type === 'tja') {
    return await parseTjaChartObjects(diff);
  }

  throw new Error('Invalid chart files.');
}

export async function loadAudioFile(audioFile: File) {
  const readAudioFile = await readFileAsArrayBuffer(audioFile);
  const audioBuffer = await decodeAudioFile(readAudioFile);

  const wavBlob = new Blob([audioBuffer], { type: 'audio/wav' });
  const wavURL = URL.createObjectURL(wavBlob);

  return new Promise<Howl>(resolve => {
    const audio = new Howl({
      src: [wavURL],
      format: [readAudioFile.extension],
      onload: () => resolve(audio),
    });
  });
}
