import type { ReadFile } from './file_util';
import { OggVorbisDecoderWebWorker } from '@wasm-audio-decoders/ogg-vorbis';
import { MPEGDecoderWebWorker } from 'mpg123-decoder';

// Credit:
// https://stackoverflow.com/questions/62172398/convert-audiobuffer-to-arraybuffer-blob-for-wav-download

const mpegDecoder = new MPEGDecoderWebWorker();
const oggVorbisDecoder = new OggVorbisDecoderWebWorker();

await Promise.all([mpegDecoder.ready, oggVorbisDecoder.ready]);

export async function decodeAudioFile(readFile: ReadFile) {
  const arrayBufferView = new Uint8Array(readFile.data);

  if (readFile.extension === 'mp3') {
    const { channelData, sampleRate } =
      await mpegDecoder.decode(arrayBufferView);
    await mpegDecoder.reset();

    return encodeToWav(channelData, sampleRate);
  } else if (readFile.extension === 'ogg') {
    const { channelData, sampleRate } =
      await oggVorbisDecoder.decode(arrayBufferView);
    await oggVorbisDecoder.reset();

    return encodeToWav(channelData, sampleRate);
  }

  throw new Error('Unsupported audio file extension.');
}

function encodeToWav(channelData: Float32Array[], sampleRate: number) {
  const [left, right] = channelData;

  const interleaved = new Float32Array(left.length + right.length);
  for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
    interleaved[dst] = left[src];
    interleaved[dst + 1] = right[src];
  }

  const wavBuffer = getWavBytes(interleaved.buffer, {
    isFloat: true,
    numChannels: 2,
    sampleRate: sampleRate,
  });
  return wavBuffer;
}

function getWavBytes(
  buffer: ArrayBuffer,
  options: { isFloat: boolean; numChannels: number; sampleRate: number },
) {
  const type = options.isFloat ? Float32Array : Uint16Array;
  const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT;

  const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }));
  const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

  wavBytes.set(headerBytes, 0);
  wavBytes.set(new Uint8Array(buffer), headerBytes.length);

  return wavBytes;
}

function getWavHeader(options: {
  isFloat: boolean;
  numChannels: number;
  sampleRate: number;
  numFrames: number;
}) {
  const numFrames = options.numFrames;
  const numChannels = options.numChannels || 2;
  const sampleRate = options.sampleRate || 48000;
  const bytesPerSample = options.isFloat ? 4 : 2;
  const format = options.isFloat ? 3 : 1;

  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;

  const buffer = new ArrayBuffer(44);
  const dv = new DataView(buffer);

  let p = 0;

  function writeString(s: string) {
    for (let i = 0; i < s.length; i++) {
      dv.setUint8(p + i, s.charCodeAt(i));
    }
    p += s.length;
  }

  function writeUint32(d: number) {
    dv.setUint32(p, d, true);
    p += 4;
  }

  function writeUint16(d: number) {
    dv.setUint16(p, d, true);
    p += 2;
  }

  writeString('RIFF'); // ChunkID
  writeUint32(dataSize + 36); // ChunkSize
  writeString('WAVE'); // Format
  writeString('fmt '); // Subchunk1ID
  writeUint32(16); // Subchunk1Size
  writeUint16(format); // AudioFormat https://i.sstatic.net/BuSmb.png
  writeUint16(numChannels); // NumChannels
  writeUint32(sampleRate); // SampleRate
  writeUint32(byteRate); // ByteRate
  writeUint16(blockAlign); // BlockAlign
  writeUint16(bytesPerSample * 8); // BitsPerSample
  writeString('data'); // Subchunk2ID
  writeUint32(dataSize); // Subchunk2Size

  return new Uint8Array(buffer);
}
