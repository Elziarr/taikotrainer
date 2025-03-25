import { getFileExtension, readFolder } from './file_util';

const AUDIO_TYPES = ['mp3', 'ogg'];
const MAP_TYPES = ['tja', 'osu'];

export interface ChartFiles {
  audio: File;
  diffs: File[];
}

export async function promptChartUpload(): Promise<ChartFiles | null> {
  const files = await readFolder();

  if (!files) {
    return null;
  }

  const audioFile = files.find(f => AUDIO_TYPES.includes(getFileExtension(f)));
  const diffFiles = files.filter(f => MAP_TYPES.includes(getFileExtension(f)));

  if (!audioFile || diffFiles.length === 0) {
    return null;
  }

  return { audio: audioFile, diffs: diffFiles };
}
