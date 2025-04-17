import { AudioSettings } from './settings/audio.svelte';
import { Howl } from 'howler';

const bigDonSound = new Howl({
  src: ['sfx/big_don.wav'],
});
const bigKaSound = new Howl({
  src: ['sfx/big_ka.wav'],
});
const donSound = new Howl({
  src: ['sfx/don.wav'],
});
const kaSound = new Howl({
  src: ['sfx/ka.wav'],
});

export class SfxPlayer {
  constructor() {
    $effect(() => {
      bigDonSound?.volume(AudioSettings.sfxVolume);
      donSound?.volume(AudioSettings.sfxVolume);
      kaSound?.volume(AudioSettings.sfxVolume);
    });
  }

  playBigDon() {
    bigDonSound.play();
  }

  playBigKa() {
    bigKaSound.play();
  }

  playDon() {
    donSound.play();
  }

  playKa() {
    kaSound.play();
  }
}
