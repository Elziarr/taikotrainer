import { Howl } from 'howler';

const donSound = new Howl({
  src: ['sfx/don.wav'],
});
const kaSound = new Howl({
  src: ['sfx/ka.wav'],
});

export class SfxPlayer {
  playDon() {
    donSound.play();
  }

  playKa() {
    kaSound.play();
  }
}
