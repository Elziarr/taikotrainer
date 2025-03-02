import type { ChartDiff } from '../chart/metadata';
import { getFileExtension, readFileAsArrayBuffer } from '../files';
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

  const arrayBufferView = new Uint8Array(readAudioFile.data);
  const blob = new Blob([arrayBufferView], { type: readAudioFile.type });
  const howlSource = URL.createObjectURL(blob);

  return new Promise<Howl>(resolve => {
    const audio = new Howl({
      src: [howlSource],
      format: [readAudioFile.extension],
      onload: () => resolve(audio),
    });
  });
}
