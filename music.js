/* 背景音乐：内置 5 首原创"二次元风"程序化音乐（WebAudio 实时合成，无版权）
 * + music/playlist.json 里自己放的 mp3 + 设置里临时添加的本地音乐文件。
 * 节拍会通过 Music.onBeat 回调，让团团跟着音乐弹跳。 */
(() => {
'use strict';
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];

let ac = null, master, comp, ana, anaData, rev, noiseBuf;
let vol = .6, playing = false, cur = 0, timer = null, nextT = 0, step = 0, audioEl = null, mediaSrc = null;
let avgBass = 0, beatCd = 0;

const Music = { tracks: [], onBeat: null, onChange: null };

/* ---------- 音频引擎 ---------- */
function ensure() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = vol;
  comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
  ana = ac.createAnalyser(); ana.fftSize = 256; anaData = new Uint8Array(ana.frequencyBinCount);
  master.connect(comp); comp.connect(ana); ana.connect(ac.destination);
  // 简易混响：衰减噪声做脉冲响应
  const len = ac.sampleRate * 2.4, ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  rev = ac.createConvolver(); rev.buffer = ir;
  const rg = ac.createGain(); rg.gain.value = .6; rev.connect(rg); rg.connect(master);
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
}
function tone(f, t, d, o = {}) {
  const osc = ac.createOscillator(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
  if (o.bend) osc.frequency.exponentialRampToValueAtTime(f * o.bend, t + d * .6);
  if (o.det) osc.detune.value = o.det;
  const g = ac.createGain(), a = o.a == null ? .005 : o.a, r = o.r == null ? .15 : o.r, pk = o.g == null ? .15 : o.g;
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(pk, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d + r);
  let n = osc;
  if (o.lp) { const bq = ac.createBiquadFilter(); bq.type = 'lowpass'; bq.frequency.value = o.lp; osc.connect(bq); n = bq; }
  n.connect(g); g.connect(master);
  if (o.send) { const s = ac.createGain(); s.gain.value = o.send; g.connect(s); s.connect(rev); }
  osc.start(t); osc.stop(t + a + d + r + .05);
}
function noise(t, d, o = {}) {
  const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const f = ac.createBiquadFilter(); f.type = o.type || 'highpass'; f.frequency.value = o.f || 7000;
  const g = ac.createGain(); g.gain.setValueAtTime(o.g == null ? .1 : o.g, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  src.connect(f); f.connect(g); g.connect(master);
  if (o.send) { const s = ac.createGain(); s.gain.value = o.send; g.connect(s); s.connect(rev); }
  src.start(t, Math.random() * .5); src.stop(t + d + .02);
}
const kick = (t, v = .5) => tone(140, t, .1, { type: 'sine', bend: .3, g: v, a: .002, r: .12 });
const snare = (t, v = .25) => { noise(t, .14, { type: 'bandpass', f: 1900, g: v, send: .15 }); tone(190, t, .06, { type: 'triangle', g: v * .5, r: .05 }); };
const clap = (t, v = .3) => { for (let k = 0; k < 3; k++) noise(t + k * .012, .09, { type: 'bandpass', f: 1500, g: v, send: .3 }); };
const hat = (t, v = .1, open) => noise(t, open ? .16 : .04, { f: 7500, g: v });
const beat = (t, s = 1) => setTimeout(() => Music.onBeat && playing && Music.onBeat(s), Math.max(0, (t - ac.currentTime) * 1000));

/* ---------- 5 首内置曲目（每首都会随机变奏，永不重复） ---------- */
const GEN = [];

// 1. 糖果云朵：未来贝斯风的甜系音乐盒
{ const CH = [[53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62], [57, 60, 64, 67]], ARP = [0, 1, 2, 3, 2, 1, 2, 3], PENT = [0, 2, 4, 7, 9];
  GEN.push({ id: 'candy', title: '糖果云朵', emoji: '☁️', bpm: 132, swing: 0,
    play(i, t, sd) {
      const bar = (i >> 4) & 3, s = i & 15, ch = CH[bar];
      if (s === 0) ch.forEach(n => tone(mtof(n + 12), t, sd * 15, { type: 'sawtooth', lp: 1000, g: .03, a: .4, r: .6, send: .5, det: rnd(-8, 8) }));
      if (s % 4 === 0) { kick(t, .45); beat(t, 1); }
      if (s === 4 || s === 12) clap(t, .22);
      if (s % 4 === 2) hat(t, .08);
      if (s % 2 === 0 || Math.random() < .15) {
        const n = ch[ARP[(s >> 1) & 7]] + 24;
        tone(mtof(n), t, .1, { type: 'triangle', g: .1, a: .002, r: .4, send: .55 }); tone(mtof(n + 12), t, .04, { g: .035, r: .25, send: .5 });
      }
      if (s === 0 || s === 6 || s === 10) tone(mtof(ch[0] - 12), t, sd * 2.5, { g: .3, a: .01, r: .1 });
      if (s % 2 === 0 && Math.random() < (bar % 2 ? .5 : .32)) tone(mtof(72 + pick(PENT) + (Math.random() < .3 ? 12 : 0)), t, sd * 1.6, { type: 'sine', g: .09, r: .35, send: .5 });
    } });
}
// 2. 午后咖啡：lo-fi 慢摇
{ const CH = [[50, 53, 57, 60, 64], [43, 47, 50, 53, 57], [48, 52, 55, 59, 62], [45, 48, 52, 55, 59]], PENT = [62, 65, 67, 69, 72, 74];
  GEN.push({ id: 'lofi', title: '午后咖啡', emoji: '☕', bpm: 76, swing: .32,
    play(i, t, sd) {
      const bar = (i >> 4) & 3, s = i & 15, ch = CH[bar];
      if (s === 0 || s === 10) ch.forEach((n, k) => { tone(mtof(n + 12), t + k * .012, sd * 6, { type: 'sine', g: .075, a: .01, r: .8, send: .3 }); tone(mtof(n + 24), t + k * .012, sd * 2, { type: 'triangle', g: .018, r: .4 }); });
      if (s === 0 || s === 10) { kick(t, .4); beat(t, 1); } if (s === 8) { snare(t, .18); beat(t, .6); }
      if (s % 2 === 0) hat(t, .05 + Math.random() * .04, s === 14);
      if (s === 0 || s === 7 || s === 12) tone(mtof(ch[0]), t, sd * 3, { g: .26, a: .01, r: .2, lp: 500 });
      if (s % 2 === 0 && Math.random() < .22) tone(mtof(pick(PENT)), t, sd * 2, { type: 'triangle', g: .09, a: .01, r: .5, send: .4 });
      if (Math.random() < .12) noise(t, .02, { f: 3000, g: .05 });   // 黑胶噼啪声
    } });
}
// 3. 像素冒险：8-bit 芯片音乐
{ const ROOT = [48, 55, 57, 53], PENT = [0, 2, 4, 7, 9, 12, 14]; let mi = 3;
  GEN.push({ id: 'chip', title: '像素冒险', emoji: '🎮', bpm: 148, swing: 0,
    play(i, t, sd) {
      const bar = (i >> 4) & 3, s = i & 15, r = ROOT[bar];
      if (s % 4 === 0) { kick(t, .4); beat(t, 1); } if (s === 8 || s === 14) noise(t, .09, { type: 'bandpass', f: 2500, g: .12 });
      if (s % 2 === 0) hat(t, .05);
      tone(mtof(r - 12 + (s % 4 === 2 ? 12 : 0)), t, sd * .9, { type: 'triangle', g: .22, a: .002, r: .03 });
      if ([0, 3, 6, 8, 11, 14].includes(s)) tone(mtof(r + [0, 4, 7, 12][(s >> 1) & 3] + 12), t, sd * .8, { type: 'square', g: .035, a: .002, r: .04, lp: 3000 });
      if (s % 2 === 0 || Math.random() < .25) { mi = Math.max(0, Math.min(PENT.length - 1, mi + pick([-2, -1, -1, 0, 1, 1, 2]))); if (Math.random() < .85) tone(mtof(r + 24 + PENT[mi]), t, sd * 1.6, { type: 'square', g: .05, a: .002, r: .08, lp: 4000, send: .15 }); }
    } });
}
// 4. 星空钢琴：梦幻琶音
{ const CH = [[48, 52, 55, 59], [45, 48, 52, 55], [53, 57, 60, 64], [55, 59, 62, 65]], PAT = [0, 1, 2, 3, 2, 1, 3, 2]; let hi = 0;
  GEN.push({ id: 'star', title: '星空钢琴', emoji: '🌙', bpm: 66, swing: 0,
    play(i, t, sd) {
      const bar = (i >> 4) & 3, s = i & 15, ch = CH[bar];
      if (s === 0) { ch.forEach(n => tone(mtof(n + 12), t, sd * 15, { type: 'sawtooth', lp: 700, g: .022, a: 1.2, r: 1.2, send: .7, det: rnd(-7, 7) })); beat(t, 1); tone(mtof(ch[0] - 12), t, sd * 6, { g: .25, a: .05, r: .6 }); }
      if (s % 4 === 0 && s) beat(t, .5);
      if (s % 2 === 0) { const n = ch[PAT[(s >> 1) & 7]] + 12 * (1 + (s > 7 ? 1 : 0)); tone(mtof(n), t, .25, { type: 'triangle', g: .12, a: .004, r: 1.1, send: .6 }); tone(mtof(n + 12), t, .06, { g: .025, r: .5, send: .5 }); }
      if (s === 0 || s === 8) if (Math.random() < .7) { hi = (hi + pick([1, 2, 3])) % 4; tone(mtof(ch[hi] + 36), t + sd, sd * 4, { type: 'sine', g: .08, a: .01, r: 1.4, send: .8 }); }
    } });
}
// 5. 樱花和风：日式音阶琴弦
{ const SC = [0, 1, 5, 7, 8], DRONE = [45, 45, 43, 45]; let k = 2;
  GEN.push({ id: 'sakura', title: '樱花和风', emoji: '🌸', bpm: 88, swing: 0,
    play(i, t, sd) {
      const bar = (i >> 4) & 3, s = i & 15;
      if (s === 0) { tone(mtof(DRONE[bar]), t, sd * 15, { g: .18, a: .3, r: .8, lp: 600, send: .3 }); tone(mtof(DRONE[bar] + 7), t, sd * 15, { type: 'triangle', g: .04, a: .5, r: .8, send: .5 }); beat(t, 1); kick(t, .3); }
      if (s === 8) { beat(t, .6); tone(110, t, .2, { bend: .5, g: .22, r: .3, send: .3 }); }
      if (s % 2 === 0 && Math.random() < .75) {
        k = Math.max(0, Math.min(9, k + pick([-2, -1, 1, 1, 2, 3]))); const o = k >= 5 ? 12 : 0, n = 69 + SC[k % 5] + o;
        tone(mtof(n), t, .08, { type: 'triangle', g: .13, a: .002, r: .7, bend: .985, send: .5 }); tone(mtof(n + 12), t, .03, { g: .03, r: .3, send: .4 });
      }
      if (s === 14 && Math.random() < .4) for (let j = 0; j < 5; j++) tone(mtof(81 + SC[j]), t + j * .045, .05, { type: 'triangle', g: .06, r: .5, send: .6 });   // 刮奏
      if (s === 4 && Math.random() < .35) tone(mtof(93), t, .05, { g: .05, r: 1.2, send: .8 });   // 风铃
    } });
}
Music.tracks = GEN.map(g => ({ id: g.id, title: g.title, emoji: g.emoji, type: 'gen', gen: g }));

/* ---------- 播放控制 ---------- */
function stopAll() {
  clearInterval(timer); timer = null;
  if (audioEl) { audioEl.pause(); }
}
function startCur() {
  stopAll(); ensure();
  const tr = Music.tracks[cur]; if (!tr) return;
  if (tr.type === 'gen') {
    nextT = ac.currentTime + .1; step = 0;
    timer = setInterval(() => {
      while (nextT < ac.currentTime + .25) {
        const g = tr.gen, sd = 60 / g.bpm / 4; let t = nextT; if (g.swing && step % 2 === 1) t += sd * g.swing;
        g.play(step, t, sd); nextT += sd; step++;
      }
    }, 30);
  } else {
    if (!audioEl) { audioEl = new Audio(); audioEl.crossOrigin = 'anonymous'; audioEl.addEventListener('ended', () => Music.next()); mediaSrc = ac.createMediaElementSource(audioEl); mediaSrc.connect(master); }
    audioEl.src = tr.url; audioEl.play().catch(() => {});
  }
}
Music.play = () => { ensure(); playing = true; startCur(); Music.onChange && Music.onChange(); };
Music.pause = () => { playing = false; stopAll(); Music.onChange && Music.onChange(); };
Music.toggle = () => (playing ? Music.pause() : Music.play());
Music.select = i => { cur = (i + Music.tracks.length) % Music.tracks.length; if (playing) startCur(); Music.onChange && Music.onChange(); };
Music.next = () => { Music.select(cur + 1); };
Music.isPlaying = () => playing;
Music.current = () => cur;
Music.setVol = v => { vol = v; if (master) master.gain.value = v; };
Music.selectById = id => { const i = Music.tracks.findIndex(t => t.id === id); if (i >= 0) cur = i; };
Music.addFiles = files => {
  for (const f of files) Music.tracks.push({ id: 'local:' + f.name, title: f.name.replace(/\.[^.]+$/, ''), emoji: '🎧', type: 'file', url: URL.createObjectURL(f) });
  Music.onChange && Music.onChange();
};
Music.loadPlaylist = async () => {   // 读取 music/playlist.json（可选）
  try {
    const r = await fetch('music/playlist.json'); if (!r.ok) return;
    const list = await r.json();
    for (const it of list) Music.tracks.push({ id: 'file:' + it.file, title: it.title || it.file, emoji: '🎧', type: 'file', url: it.file });
  } catch (e) {}
};
/* 本地文件没有节拍信息：用低频能量突增来检测 */
Music.update = dt => {
  if (!playing || !ac || !Music.tracks[cur] || Music.tracks[cur].type !== 'file') return;
  beatCd -= dt; ana.getByteFrequencyData(anaData);
  let b = 0; for (let i = 1; i < 6; i++) b += anaData[i]; b /= 5;
  if (b > avgBass * 1.3 && b > 140 && beatCd <= 0) { beatCd = .28; Music.onBeat && Music.onBeat(Math.min(1.5, b / 200)); }
  avgBass = avgBass * .93 + b * .07;
};
window.Music = Music;
})();
