import { Howl } from 'howler';

const bigDonSound = new Howl({
  src: ['sfx/big_don.ogg'],
});
const donSound = new Howl({
  src: ['sfx/don.wav'],
});
const kaSound = new Howl({
  src: ['sfx/ka.wav'],
});

export class SfxPlayer {
  playBigDon() {
    bigDonSound.play();
  }

  playBigKa() {
    // TODO
    bigDonSound.play();
  }

  playDon() {
    donSound.play();
  }

  playKa() {
    kaSound.play();
  }
}
