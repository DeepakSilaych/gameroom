// Tiny WebAudio synth — no audio assets. Every effect is a few oscillator
// notes. Muting is persisted per browser.

let ctx = null;
const audio = () => (ctx ??= new (window.AudioContext || window.webkitAudioContext)());

const MUTE_KEY = 'gameroom-muted';
export const isMuted = () => localStorage.getItem(MUTE_KEY) === '1';
export const setMuted = m => localStorage.setItem(MUTE_KEY, m ? '1' : '0');

function tone(freq, { at = 0, dur = 0.12, type = 'sine', gain = 0.2, slide = 0 } = {}) {
  if (isMuted()) return;
  const ac = audio();
  if (ac.state === 'suspended') ac.resume();
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  // short rattle while the die tumbles
  dice() {
    for (let i = 0; i < 5; i++) {
      tone(180 + Math.random() * 240, { at: i * 0.07, dur: 0.05, type: 'square', gain: 0.08 });
    }
  },
  move() {
    tone(340, { dur: 0.09, type: 'triangle', gain: 0.22, slide: 160 });
  },
  capture() {
    tone(520, { dur: 0.1, type: 'sawtooth', gain: 0.16 });
    tone(370, { at: 0.09, dur: 0.12, type: 'sawtooth', gain: 0.16 });
    tone(240, { at: 0.2, dur: 0.2, type: 'sawtooth', gain: 0.14, slide: -120 });
  },
  finish() {
    [523, 659, 784].forEach((f, i) => tone(f, { at: i * 0.09, dur: 0.15, type: 'triangle' }));
  },
  win() {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
      tone(f, { at: i * 0.13, dur: 0.22, type: 'triangle', gain: 0.25 })
    );
  },
  yourTurn() {
    tone(660, { dur: 0.08, type: 'sine', gain: 0.12 });
    tone(880, { at: 0.09, dur: 0.1, type: 'sine', gain: 0.12 });
  },
};
