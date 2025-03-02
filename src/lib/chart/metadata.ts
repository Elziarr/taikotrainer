export interface ChartDiff {
  name: string;
  file: File;
  isConvert: boolean;
  starRating: number;
}

export interface ChartMetadata {
  title: string;
  artist: string | null;
  creator: string | null;
  type: 'osu' | 'tja';
}

export interface ChartInfo extends ChartMetadata {
  audioFile: File;
  diffs: ChartDiff[];
}
