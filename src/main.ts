import App from './App.svelte';
import './app.css';
import { Assets } from 'pixi.js';
import { mount } from 'svelte';

const manifest = {
  bundles: [
    {
      name: 'sprites',
      assets: [
        {
          alias: 'playfield_left',
          src: 'sprites/playfield_left.png',
        },
        {
          alias: 'playfield_track',
          src: 'sprites/playfield_track.png',
        },
        {
          alias: 'hit_section',
          src: 'sprites/hit_section.png',
        },
        {
          alias: 'hitcircle_don',
          src: 'sprites/hitcircle_don.png',
        },
        {
          alias: 'hitcircle_ka',
          src: 'sprites/hitcircle_ka.png',
        },
        {
          alias: 'hitcircle_don_big',
          src: 'sprites/hitcircle_don_big.png',
        },
        {
          alias: 'hitcircle_ka_big',
          src: 'sprites/hitcircle_ka_big.png',
        },
        {
          alias: 'balloon',
          src: 'sprites/balloon.png',
        },
        {
          alias: 'drumroll_head',
          src: 'sprites/drumroll_head.png',
        },
        {
          alias: 'drumroll_head_big',
          src: 'sprites/drumroll_head_big.png',
        },
        {
          alias: 'drumroll_tail',
          src: 'sprites/drumroll_tail.png',
        },
        {
          alias: 'drum',
          src: 'sprites/drum.png',
        },
        {
          alias: 'drum_left_don',
          src: 'sprites/drum_left_don.png',
        },
        {
          alias: 'drum_left_ka',
          src: 'sprites/drum_left_ka.png',
        },
        {
          alias: 'drum_right_don',
          src: 'sprites/drum_right_don.png',
        },
        {
          alias: 'drum_right_ka',
          src: 'sprites/drum_right_ka.png',
        },
      ],
    },
  ],
};

await Assets.init({ manifest });
await Assets.loadBundle(['sprites']);

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
