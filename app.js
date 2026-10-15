/* 团团表情弹幕乐园 —— 手绘表情包 → 彩色弹幕壁纸 / 戳泡泡小游戏 */
(() => {
'use strict';
const COUNT = 52;               // extract.py 切出的贴纸数量上限（实际以成功加载的为准）
const $ = s => document.querySelector(s);
const cvs = $('#c'), ctx = cvs.getContext('2d');
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let W = 0, H = 0, DPR = 1;

/* ---------- 主题 ---------- */
const THEMES = {
  candy:   { name: '🍬 糖果', bg: ['#ffd1e8', '#ffe9c7', '#c9f0ff', '#e5d1ff'],
             fills: [['#ff9ec7', '#ffc7de'], ['#ffe27a', '#ffb86b'], ['#9ee8d0', '#c4f5e6'], ['#a9d4ff', '#d4e8ff'], ['#d3b4ff', '#f0dcff'], ['#ffb199', '#ffd6c4']] },
  sea:     { name: '🌊 海盐', bg: ['#bdeeff', '#d6f7ee', '#c4d8ff', '#fff2d9'],
             fills: [['#7fd8f5', '#c2f0ff'], ['#8ff0c8', '#d0fae8'], ['#8aa8ff', '#c9d6ff'], ['#fff1a8', '#ffe07a'], ['#ffc2d9', '#ffe0ec']] },
  sunset:  { name: '🌇 晚霞', bg: ['#ffb199', '#ff8fb1', '#c59bff', '#ffd79a'],
             fills: [['#ffd36e', '#ff9e5e'], ['#ff8fb1', '#ffc0d3'], ['#c59bff', '#e3ceff'], ['#fff0b3', '#ffe08a'], ['#ff7a7a', '#ffb0a0']] },
  matcha:  { name: '🍵 抹茶', bg: ['#e4f7c8', '#fff7d6', '#cfeedd', '#f8e3ff'],
             fills: [['#a8e063', '#d8f5a8'], ['#fff09a', '#ffe066'], ['#ffc9dd', '#ffe3ee'], ['#b8f0e0', '#e0fbf4'], ['#ffd7a8', '#ffeacc']] },
  night:   { name: '🌙 星夜', bg: ['#2a2358', '#3d2b6b', '#1f3a6b', '#4a2a68'],
             fills: [['#ff6fb5', '#ff9ed0'], ['#6ff2ff', '#a8f8ff'], ['#ffe96b', '#fff4a8'], ['#b58bff', '#d6bfff'], ['#7dffb0', '#b8ffd6']] },
  rainbow: { name: '🌈 彩虹', bg: ['#ffd1e8', '#fff1b8', '#c4f5e6', '#c9d6ff'], fills: null }
};
THEMES.rainbow.fills = [].concat(THEMES.candy.fills, THEMES.sea.fills, THEMES.sunset.fills, THEMES.matcha.fills, THEMES.night.fills);
const INKS = ['#2b2140', '#3a2a5c', '#5a2a3c', '#1f3a5a', '#2d3a2d', '#4a2a1a'];
const PATTERNS = ['none', 'none', 'dots', 'stripes', 'hearts', 'stars', 'grid'];

/* ---------- 文案 ---------- */
const SAY = ['啊？', '咕嘎！', '我是一朵蘑菇', '蛙趣', '嘿嘿嘿嘿嘿', '？！？！？！', '电量1%灵魂100%', '好想变成云', '啊对对对', '呜啊啊啊啊', '芭比Q了', '曼波~', '哈基米', 'zzZ…', '我超！', '歪比巴卜', '404脑子未找到', '头发在跳舞', '(ง •̀_•́)ง', '(´;ω;`)', '👁👄👁', '饿饿饿饿', '蚌埠住了', '扣1送团团', '我在地球OL'];
const DANMU = ['我是一颗卷心菜🥬', '芜湖起飞！！！', '正在加载快乐…99%', '宇宙的尽头是烧烤', '今日宜：发呆　忌：清醒', 'emo.exe 已停止运行', '好想变成猫然后逃跑', '大脑已离家出走', '404 脑子未找到', '摆烂摆烂摆烂摆烂', '咕咕嘎嘎咕咕嘎嘎', '我已经是一朵蘑菇了🍄', '我的快乐被外星人偷走了', '一觉醒来我成了团子', '你是我的小饼干🍪', '地球OL 已掉线', '曼波曼波曼波', '哈基米南北绿豆~', '绝绝子！！', '电量 1% 灵魂 100%', '睡觉睡觉睡觉睡觉', '想吃火锅！！！！', '啊？啊！啊？啊！', '今天的我是云朵做的☁', '不要问 问就是爱你💗', '蚌埠住了', '(ง •̀_•́)ง 冲', '(´・ω・`) 哦', '哇哦哇哦哇哦', '？！？！？！？！', '爱你 但是不说', '嘿嘿嘿嘿嘿嘿嘿', '一口奶茶 一口命', '给我一个拥抱 或者两个', '👁👄👁', '芭比Q了芭比Q了', 'duang~duang~', '咪咪咪咪咪咪咪咪', '亲亲 mua~mua~'];

/* 夸张字体池：网络字体（有网时加载）→ 系统自带手写/圆体/行楷 → 通用粗体 */
const FONT_POOL = [
  '"ZCOOL KuaiLe","Yuppy SC","YouYuan","Microsoft YaHei"',
  '"ZCOOL QingKe HuangYou","Wawati SC","YouYuan","Microsoft YaHei"',
  '"Ma Shan Zheng","Xingkai SC","STXingkai","KaiTi"',
  '"Zhi Mang Xing","Xingkai SC","STXingkai","KaiTi"',
  '"Liu Jian Mao Cao","Hanzipen SC","STXingkai","KaiTi"',
  '"Long Cang","Hanzipen SC","STXingkai","KaiTi"',
  '"Noto Serif SC","Libian SC","LiSu","SimHei"',
  '"Yuanti SC","YouYuan","Comic Sans MS","Microsoft YaHei"',
  '"Weibei SC","Baoli SC","LiSu","SimHei"',
  'Impact,"Comic Sans MS","Microsoft YaHei"'
];
const TXT_STYLES = ['jelly', 'wave', 'shake', 'grad', 'bounce', 'vertical', 'neon', 'stamp'];
const BUBBLE_FONT = '"ZCOOL KuaiLe","Yuppy SC","YouYuan","Microsoft YaHei"';
const RAINBOW = ['#ff6fa5', '#ffb347', '#ffe14a', '#6fe0a8', '#5cc8ff', '#a98bff'];
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5];

/* ---------- 状态 ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('tt_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('tt_' + k, JSON.stringify(v)); } catch (e) {} }
};
const S = {
  theme: store.get('theme', 'candy'),
  flow: store.get('flow', 'h'),
  density: store.get('density', 0),
  speed: store.get('speed', 1),
  txt: store.get('txt', 'on'),
  props: store.get('props', 'on'),
  sound: store.get('sound', false),
  mode: 'wall',            // wall | game
  best: store.get('best', 0)
};
const imgs = [];                 // {ink, fill}
let ents = [], parts = [], texts = [];
let T = 0, last = 0, idleT = 0, bgPhase = 0;
const stars = [];                // 背景小星星/光斑

/* ---------- 工具：画布 ---------- */
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; };

function heartPath(g, s) {
  g.beginPath(); g.moveTo(0, s * .35);
  g.bezierCurveTo(-s * 1.1, -s * .3, -s * .45, -s * 1.0, 0, -s * .38);
  g.bezierCurveTo(s * .45, -s * 1.0, s * 1.1, -s * .3, 0, s * .35); g.closePath();
}
function starPath(g, r, pts = 5, inner = .45) {
  g.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = -Math.PI / 2 + i * Math.PI / pts, rr = i % 2 ? r * inner : r;
    i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.closePath();
}

/* ---------- 贴纸上色（线稿 → 彩色 + 白边 + 花纹） ---------- */
function makeSprite(id, o) {
  const { ink, fill } = imgs[id];
  const w = ink.width, h = ink.height, M = 18, cw = w + M * 2, ch = h + M * 2;
  const out = mk(cw, ch), g = out.getContext('2d');

  // 1) 白色描边（模拟贴纸模切边）
  const sil = mk(cw, ch), sg = sil.getContext('2d');
  for (const R of [10, 6]) for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2; sg.drawImage(fill, M + Math.cos(a) * R, M + Math.sin(a) * R);
  }
  sg.drawImage(fill, M, M);
  sg.globalCompositeOperation = 'source-in';
  sg.fillStyle = o.glow || '#ffffff'; sg.fillRect(0, 0, cw, ch);
  g.shadowColor = o.glow ? o.glow : 'rgba(90,50,140,.30)'; g.shadowBlur = o.glow ? 22 : 12; g.shadowOffsetY = o.glow ? 0 : 5;
  g.drawImage(sil, 0, 0); g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0;

  // 2) 彩色填充
  const col = mk(cw, ch), c = col.getContext('2d');
  c.drawImage(fill, M, M);
  c.globalCompositeOperation = 'source-atop';
  const ang = rnd(0, Math.PI * 2), cx = cw / 2, cy = ch / 2, rr = Math.max(cw, ch) * .6;
  const gr = c.createLinearGradient(cx - Math.cos(ang) * rr, cy - Math.sin(ang) * rr, cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
  if (o.rainbow) { ['#ff8fb1', '#ffd36e', '#9ee8d0', '#a9d4ff', '#d3b4ff'].forEach((s, i, a) => gr.addColorStop(i / (a.length - 1), s)); }
  else { gr.addColorStop(0, o.fill[0]); gr.addColorStop(1, o.fill[1]); }
  c.fillStyle = gr; c.fillRect(0, 0, cw, ch);
  // 花纹
  c.fillStyle = 'rgba(255,255,255,.5)'; c.strokeStyle = 'rgba(255,255,255,.5)';
  const p = o.pattern, step = Math.max(22, Math.min(cw, ch) / 7);
  if (p === 'dots') { for (let y = 0; y < ch + step; y += step) for (let x = ((y / step | 0) % 2) * step / 2; x < cw + step; x += step) { c.beginPath(); c.arc(x, y, step * .17, 0, 7); c.fill(); } }
  else if (p === 'stripes') { c.lineWidth = step * .28; c.save(); c.translate(cx, cy); c.rotate(.6); for (let x = -rr; x < rr; x += step * .8) { c.beginPath(); c.moveTo(x, -rr); c.lineTo(x, rr); c.stroke(); } c.restore(); }
  else if (p === 'grid') { c.lineWidth = 3; for (let x = 0; x < cw; x += step) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, ch); c.stroke(); } for (let y = 0; y < ch; y += step) { c.beginPath(); c.moveTo(0, y); c.lineTo(cw, y); c.stroke(); } }
  else if (p === 'hearts' || p === 'stars') { for (let y = step / 2; y < ch; y += step * 1.1) for (let x = ((y / step | 0) % 2) * step / 2; x < cw; x += step * 1.1) { c.save(); c.translate(x, y); p === 'hearts' ? heartPath(c, step * .22) : starPath(c, step * .24); c.fill(); c.restore(); } }
  // 高光（胶质感）
  const hl = c.createRadialGradient(cw * .32, ch * .25, 2, cw * .32, ch * .25, Math.max(cw, ch) * .55);
  hl.addColorStop(0, 'rgba(255,255,255,.55)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = hl; c.fillRect(0, 0, cw, ch);
  // 腮红：脸颊两侧柔和的粉晕 + 小斜线
  if (o.blush) {
    const by = M + h * .6, bx = w * .27, br = Math.max(14, w * .14);
    for (const sgn of [-1, 1]) {
      c.save(); c.translate(cw / 2 + sgn * bx, by); c.scale(1.35, 1);
      const bg = c.createRadialGradient(0, 0, 1, 0, 0, br);
      bg.addColorStop(0, o.blush); bg.addColorStop(1, 'rgba(255,120,160,0)');
      c.fillStyle = bg; c.beginPath(); c.arc(0, 0, br, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = Math.max(2, br * .08); c.lineCap = 'round';
      for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * br * .28 - br * .06, br * .2); c.lineTo(i * br * .28 + br * .1, -br * .2); c.stroke(); }
      c.restore();
    }
  }
  // 闪粉亮片：金/白/粉的小点与四角星
  if (o.glitter) {
    const cols = ['#ffffff', '#fff3a8', '#ffd6f0', '#d6f3ff'];
    for (let i = 0; i < 70; i++) { c.globalAlpha = rnd(.55, 1); c.fillStyle = pick(cols); c.beginPath(); c.arc(rnd(0, cw), rnd(0, ch), rnd(1, 3.2), 0, 7); c.fill(); }
    c.globalAlpha = 1;
    for (let i = 0; i < 5; i++) {
      const x = rnd(cw * .15, cw * .85), y = rnd(ch * .15, ch * .85), r = rnd(7, 15);
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill();
    }
  }
  g.drawImage(col, 0, 0);
  // 贴纸表面的斜向光泽带
  if (o.shine) {
    const sh = mk(cw, ch), s2 = sh.getContext('2d');
    s2.drawImage(fill, M, M); s2.globalCompositeOperation = 'source-in';
    const sg2 = s2.createLinearGradient(0, ch * .1, cw, ch * .5);
    sg2.addColorStop(0, 'rgba(255,255,255,0)'); sg2.addColorStop(.45, 'rgba(255,255,255,0)'); sg2.addColorStop(.5, 'rgba(255,255,255,.4)'); sg2.addColorStop(.58, 'rgba(255,255,255,0)'); sg2.addColorStop(1, 'rgba(255,255,255,0)');
    s2.fillStyle = sg2; s2.fillRect(0, 0, cw, ch); g.drawImage(sh, 0, 0);
  }

  // 3) 线稿染色
  const lk = mk(cw, ch), l = lk.getContext('2d');
  l.drawImage(ink, M, M); l.globalCompositeOperation = 'source-in'; l.fillStyle = o.ink; l.fillRect(0, 0, cw, ch);
  g.drawImage(lk, 0, 0);
  return out;
}

function randomLook(forceRainbow) {
  const th = THEMES[S.theme];
  const deco = {
    blush: Math.random() < .8 ? pick(['rgba(255,105,150,.6)', 'rgba(255,140,120,.55)', 'rgba(230,110,200,.5)']) : null,
    glitter: Math.random() < .6, shine: Math.random() < .5
  };
  return forceRainbow
    ? { rainbow: true, pattern: 'stars', ink: '#2b2140', glow: 'rgba(255,214,90,.95)', blush: 'rgba(255,105,150,.6)', glitter: true, shine: true }
    : Object.assign({ fill: pick(th.fills), ink: S.theme === 'night' ? pick(['#1d1740', '#2b2140']) : pick(INKS), pattern: pick(PATTERNS) }, deco);
}

/* ---------- 实体（团团） ---------- */
function baseSize() { return clamp(Math.min(W, H) * (W > H ? .2 : .26), 84, 190); }

function newEnt(initial, opt = {}) {
  const e = { id: opt.id != null ? opt.id : (Math.random() * imgs.length) | 0, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, sq: 0, sqv: 0, pop: 0,
    ph: rnd(0, 7), fq: rnd(.8, 2), amp: rnd(8, 30), sc: rnd(.75, 1.25), grab: null, say: null, props: [], born: T, rainbow: !!opt.rainbow, dead: false, spawnAnim: 0 };
  assign(e, opt.rainbow);
  respawn(e, initial);
  if (opt.x != null) { e.x = opt.x; e.y = opt.y; e.vx = opt.vx || 0; e.vy = opt.vy || 0; e.spawnAnim = .001; e.sqv = 6; }
  return e;
}
function assign(e, rainbow) {
  e.sprite = makeSprite(e.id, randomLook(rainbow));
  e.tw = Array.from({ length: 4 }, () => ({ a: rnd(0, Math.PI * 2), r: rnd(.55, .95), ph: rnd(0, 7), f: rnd(1.5, 3.5), s: rnd(.7, 1.4) }));
  e.rainbow = !!rainbow;
  e.size = baseSize() * e.sc * (rainbow ? 1.1 : 1);
  e.dir = Math.random() < .5 ? 1 : -1;
  e.spd = rnd(.6, 1.4);
}
function flowV(e) {
  const s = S.speed * e.spd, t = T;
  if (S.mode === 'game') return [Math.sin(t * e.fq + e.ph) * e.amp * 1.4, -e.rise];
  switch (S.flow) {
    case 'h': return [e.dir * 70 * s, Math.cos(t * e.fq + e.ph) * e.amp * e.fq];
    case 'up': return [Math.sin(t * e.fq + e.ph) * e.amp * 1.6, -48 * s];
    case 'rain': return [Math.sin(t * e.fq + e.ph) * e.amp, 70 * s];
    default: return [e.dvx * s, e.dvy * s];
  }
}
function respawn(e, initial) {
  const m = e.size * .7;
  if (S.mode === 'game') {
    e.rise = rnd(120, 230) * (1 + Math.min(game.t, 25) * .02); e.x = rnd(m, W - m); e.y = H + m * (initial ? rnd(0, 3) : 1.2); e.vx = 0; e.vy = -e.rise; return;
  }
  e.dvx = rnd(-45, 45); e.dvy = rnd(-45, 45);
  const f = S.flow;
  if (initial) { e.x = rnd(0, W); e.y = rnd(0, H); }
  else if (f === 'h') { e.x = e.dir > 0 ? -m : W + m; e.y = rnd(m * .5, H - m * .5); }
  else if (f === 'up') { e.x = rnd(0, W); e.y = H + m; }
  else if (f === 'rain') { e.x = rnd(0, W); e.y = -m; }
  else { e.x = rnd(m, W - m); e.y = rnd(m, H - m); }
  const v = flowV(e); e.vx = v[0]; e.vy = v[1];
  e.rot = 0; e.vr = 0;
}
function targetCount() {
  if (S.mode === 'game') return 0;
  return S.density || clamp(Math.round(W * H / 90000), 10, 26);
}

/* ---------- 粒子 ---------- */
function burst(x, y, n, colors, kind) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, Math.PI * 2), sp = rnd(80, 360);
    parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, life: 0, max: rnd(.7, 1.4), size: rnd(8, 20),
      type: kind || pick(['heart', 'star', 'dot', 'star']), color: pick(colors || ['#ff7eb6', '#ffd36e', '#7fd8f5', '#b58bff', '#8ff0c8']), rot: rnd(0, 6), vr: rnd(-6, 6) });
  }
  if (parts.length > 400) parts.splice(0, parts.length - 400);
}
function sparkle(x, y) {
  parts.push({ x: x + rnd(-8, 8), y: y + rnd(-8, 8), vx: rnd(-30, 30), vy: rnd(-40, 10), life: 0, max: rnd(.5, .9), size: rnd(6, 13),
    type: 'star', color: pick(['#fff', '#ffe27a', '#ffb3d9', '#b5e8ff']), rot: rnd(0, 6), vr: rnd(-4, 4), grav: 0 });
}

/* ---------- 文字弹幕 ---------- */
const fontAsked = new Set();
function ensureFont(family, text) {   // 触发网络/本地字体按需加载（失败则自动用后备字体）
  const first = family.split(',')[0];
  if (!document.fonts || !document.fonts.load) return;
  const key = first + text;
  if (fontAsked.has(key)) return; fontAsked.add(key);
  document.fonts.load(`48px ${first}`, text).catch(() => {});
}
function spawnText(content, own) {
  const base = clamp(Math.min(W, H) * .06, 24, 64);
  const style = own ? pick(['jelly', 'wave', 'grad', 'bounce']) : pick(TXT_STYLES);
  const family = pick(FONT_POOL);
  let text = content, fsz = base * rnd(.8, 1.5), vx = -rnd(55, 120) * S.speed, vy = 0;
  let x = W + 20, y = rnd(H * .08, H * .92);
  if (own) fsz = base * 1.9;
  if (style === 'shake') fsz = base * rnd(1.2, 1.9);
  if (style === 'vertical') { text = [...content].slice(0, 9).join(''); vx = 0; vy = rnd(50, 100) * S.speed; x = rnd(W * .05, W * .95); y = -fsz * text.length; }
  if (own) vx *= 1.2;
  const th = THEMES[S.theme], chars = [...text];
  ensureFont(family, text);
  const cs = [pick(RAINBOW), pick(RAINBOW), pick(RAINBOW)];
  texts.push({ text, chars, jit: chars.map(() => rnd(-1, 1)), style, family, fs: fsz, x, y, vx, vy, w: fsz * chars.length, h: fsz * 1.4,
    color: cs[0], color2: cs[1], color3: cs[2], tilt: style === 'vertical' || style === 'giant' ? rnd(-.1, .1) : rnd(-.2, .2), own: !!own, ph: rnd(0, 7), age: 0 });
}

/* ---------- 声音 ---------- */
let actx = null;
function beep(i, vol = .12) {
  if (!S.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.type = 'sine'; o.frequency.setValueAtTime(PENTA[i % PENTA.length], t);
    o.frequency.exponentialRampToValueAtTime(PENTA[i % PENTA.length] * 1.5, t + .12);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + .28);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + .3);
  } catch (e) {}
}

/* ---------- 交互 ---------- */
const ptrs = new Map();   // pointerId -> {ent,lx,ly,lt,vx,vy,sx,sy,st,moved}
function hit(x, y) {
  for (let i = ents.length - 1; i >= 0; i--) {
    const e = ents[i]; if (e.dead || e.spawnAnim) continue;
    const r = e.size * .5 * (1 + e.sq * .3);
    if ((x - e.x) ** 2 + (y - e.y) ** 2 < r * r) return e;
  }
  return null;
}
function tapEnt(e) {
  if (S.mode === 'game') return popGame(e);
  e.sqv = 7; e.vy -= 260; e.vr = rnd(-5, 5);
  e.say = { text: pick(SAY), t: 0 };
  burst(e.x, e.y - e.size * .2, 10);
  beep((Math.random() * 6) | 0);
  navigator.vibrate && navigator.vibrate(12);
}
cvs.addEventListener('pointerdown', ev => {
  ev.preventDefault(); idleT = 0; showDock(); closePanelIfOutside();
  initMotion();
  if (S.sound && !actx) beep(0, .001);
  const x = ev.clientX, y = ev.clientY, e = (S.mode === 'game') ? hit(x, y) : hit(x, y);
  const p = { ent: e, lx: x, ly: y, lt: performance.now(), vx: 0, vy: 0, sx: x, sy: y, st: performance.now(), moved: 0 };
  ptrs.set(ev.pointerId, p);
  cvs.setPointerCapture(ev.pointerId);
  if (e && S.mode === 'wall') {
    e.grab = ev.pointerId; e.ox = e.x - x; e.oy = e.y - y;
    ents.splice(ents.indexOf(e), 1); ents.push(e);
  } else if (e && S.mode === 'game') {
    tapEnt(e);
  }
});
cvs.addEventListener('pointermove', ev => {
  const p = ptrs.get(ev.pointerId), x = ev.clientX, y = ev.clientY, now = performance.now();
  if (!p) { mouse.x = x; mouse.y = y; mouse.on = ev.pointerType === 'mouse'; if (mouse.on && Math.random() < .5) sparkle(x, y); return; }
  const dt = Math.max(1, now - p.lt) / 1000;
  p.vx = p.vx * .6 + ((x - p.lx) / dt) * .4; p.vy = p.vy * .6 + ((y - p.ly) / dt) * .4;
  p.moved += Math.hypot(x - p.lx, y - p.ly); p.lx = x; p.ly = y; p.lt = now;
  if (p.ent && p.ent.grab === ev.pointerId) { p.ent.x = x + p.ent.ox; p.ent.y = y + p.ent.oy; p.ent.rot = clamp(p.vx * .0006, -.6, .6); }
  else { sparkle(x, y); if (Math.random() < .3) sparkle(x, y); }
});
const lastTap = { t: 0, x: 0, y: 0 };
function endPtr(ev) {
  const p = ptrs.get(ev.pointerId); if (!p) return; ptrs.delete(ev.pointerId);
  const now = performance.now(), quick = now - p.st < 350 && p.moved < 12;
  if (p.ent && p.ent.grab === ev.pointerId) {
    const e = p.ent; e.grab = null;
    if (quick) tapEnt(e);
    else { e.vx = clamp(p.vx, -1800, 1800); e.vy = clamp(p.vy, -1800, 1800); e.vr = clamp(p.vx * .004, -9, 9); e.sqv = 3; beep(2, .06); }
  } else if (!p.ent && quick && S.mode === 'wall') {
    // 点空白：召唤；双击：烟花
    if (now - lastTap.t < 380 && Math.hypot(lastTap.x - p.sx, lastTap.y - p.sy) < 50) {
      for (let i = 0; i < 3; i++) burst(p.sx + rnd(-40, 40), p.sy + rnd(-40, 40), 26);
      for (let i = 0; i < 4; i++) summon(p.sx, p.sy, true);
      beep(7, .15); lastTap.t = 0;
    } else { summon(p.sx, p.sy); lastTap.t = now; lastTap.x = p.sx; lastTap.y = p.sy; }
  }
}
cvs.addEventListener('pointerup', endPtr);
cvs.addEventListener('pointercancel', endPtr);
const mouse = { x: -999, y: -999, on: false };
cvs.addEventListener('pointerleave', () => { mouse.on = false; });
function summon(x, y, scatter) {
  const e = newEnt(false, { x, y, vx: scatter ? rnd(-500, 500) : rnd(-120, 120), vy: scatter ? rnd(-600, -100) : rnd(-420, -200) });
  e.vr = rnd(-8, 8); e.say = Math.random() < .5 ? { text: pick(SAY), t: 0 } : null;
  ents.push(e); burst(x, y, 8); beep((Math.random() * 8) | 0, .1);
  const cap = Math.max(targetCount() + 14, 30);
  if (ents.length > cap) ents.splice(0, ents.length - cap);
}
/* 摇一摇 */
let motionInit = false, lastShake = 0;
function initMotion() {
  if (motionInit) return; motionInit = true;
  const bind = () => window.addEventListener('devicemotion', ev => {
    const a = ev.accelerationIncludingGravity; if (!a) return;
    const m = Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z);
    if (m > 38 && performance.now() - lastShake > 900) { lastShake = performance.now(); shake(); }
  });
  if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(r => r === 'granted' && bind()).catch(() => {});
  } else bind();
}
function shake() {
  toast('哇~ 地震啦！');
  for (const e of ents) { e.vx += rnd(-900, 900); e.vy += rnd(-900, 500); e.vr = rnd(-10, 10); e.sqv = 5; e.say = Math.random() < .4 ? { text: pick(['头晕…', '呜哇！', '别摇啦']), t: 0 } : null; }
  burst(W / 2, H / 2, 40); beep(5);
}
addEventListener('keydown', ev => { if (ev.target.tagName !== 'INPUT' && ev.code === 'Space') { ev.preventDefault(); shake(); } });

/* ---------- 小游戏：戳泡泡 ---------- */
const game = { on: false, t: 0, left: 30, score: 0, combo: 0, ct: 0, spawnT: 0, over: false };
function startGame() {
  S.mode = 'game'; Object.assign(game, { on: true, t: 0, left: 30, score: 0, combo: 0, ct: 0, spawnT: 0, over: false });
  ents = []; texts = []; props = []; $('#hud').classList.add('show'); $('#bGame').classList.add('on'); $('#bGame').textContent = '🏠';
  hideCard(); updHud(); closePanel(); toast('戳破越多团团越开心！');
}
function endGame() {
  game.on = false; game.over = true;
  const nb = game.score > S.best; if (nb) { S.best = game.score; store.set('best', S.best); }
  burst(W / 2, H / 2, 60);
  showCard(`<h2>${nb ? '🎉 新纪录！' : '⏰ 时间到'}</h2><p>得分 <b style="font-size:30px;color:#ff5ca0">${game.score}</b><br>最高纪录 ${S.best}</p>
    <button class="big" id="again">再来一局</button><p style="margin:14px 0 0"><span id="back" style="cursor:pointer;text-decoration:underline">回到壁纸模式</span></p>`);
  $('#again').onclick = startGame; $('#back').onclick = toWall;
}
function toWall() {
  S.mode = 'wall'; game.on = false; $('#hud').classList.remove('show'); $('#bGame').classList.remove('on'); $('#bGame').textContent = '🎮';
  hideCard(); ents = []; props = []; fillEnts(true);
}
function popGame(e) {
  if (e.dead || !game.on) return;
  e.dead = true;
  const now = T; game.combo = (now - game.ct < 1.3) ? game.combo + 1 : 1; game.ct = now;
  const mult = 1 + Math.floor(game.combo / 5);
  let gain = e.rainbow ? 5 : 1; gain *= mult;
  if (e.rainbow) { game.left = Math.min(game.left + 3, 45); toast('⏱ +3 秒'); }
  game.score += gain;
  burst(e.x, e.y, e.rainbow ? 40 : 16, null, null);
  parts.push({ x: e.x, y: e.y - e.size * .3, vx: 0, vy: -90, life: 0, max: .9, size: 28 + Math.min(game.combo, 20), type: 'text', text: '+' + gain, color: '#ff5ca0', rot: 0, vr: 0, grav: 0 });
  beep(Math.min(game.combo, 7), .14); navigator.vibrate && navigator.vibrate(10);
  updHud();
}
function updHud() {
  $('#score').textContent = game.score; $('#time').textContent = Math.ceil(game.left);
  const c = $('#combo'); c.textContent = game.combo > 1 ? `连击 x${game.combo}` : 'x1'; c.style.transform = game.combo > 1 ? 'scale(1.15)' : 'none';
}
function stepGame(dt) {
  if (!game.on) return;
  game.t += dt; game.left -= dt; if (game.left <= 0) { game.left = 0; updHud(); return endGame(); }
  if (T - game.ct > 1.3 && game.combo) { game.combo = 0; }
  game.spawnT -= dt;
  if (game.spawnT <= 0) {
    game.spawnT = Math.max(.22, 0.65 - game.t * .012);
    if (ents.length < 26) ents.push(newEnt(false, { rainbow: Math.random() < .09 }));
  }
  updHud();
}

/* ---------- 主更新 ---------- */
function fillEnts(initial) {
  const n = targetCount();
  while (ents.length < n) ents.push(newEnt(initial));
  while (ents.length > n && S.mode === 'wall' && ents.length > 0 && !S._keepExtra) { const r = ents.shift(); r.dead = true; }
}

function update(dt) {
  T += dt; bgPhase += dt * .06;
  stepGame(dt);
  const wall = S.mode === 'wall';

  for (const e of ents) {
    if (e.spawnAnim) { e.spawnAnim = Math.min(1, e.spawnAnim + dt * 4); if (e.spawnAnim >= 1) e.spawnAnim = 0; }
    // 挤压弹簧
    e.sqv += (-e.sq * 160 - e.sqv * 9) * dt; e.sq += e.sqv * dt * .1;
    e.sq = clamp(e.sq, -.6, .6);
    if (e.say) { e.say.t += dt; if (e.say.t > 2.2) e.say = null; }
    if (e.grab != null) { e.vx = 0; e.vy = 0; continue; }
    // 速度向"弹幕流"回归
    const fv = flowV(e), k = wall ? 1.4 : 3;
    e.vx += (fv[0] - e.vx) * Math.min(1, dt * k); e.vy += (fv[1] - e.vy) * Math.min(1, dt * k);
    // 鼠标害羞
    if (mouse.on && wall) {
      const dx = e.x - mouse.x, dy = e.y - mouse.y, d = Math.hypot(dx, dy), r = e.size * .75;
      if (d < r && d > 1) { const f = (1 - d / r) * 1400 * dt; e.vx += dx / d * f; e.vy += dy / d * f; e.sqv += .4; }
    }
    e.vr += (-e.rot * 6 - e.vr * 2.2) * dt;
    e.x += e.vx * dt; e.y += e.vy * dt; e.rot += e.vr * dt;
    // 边界
    const m = e.size;
    if (wall && S.flow === 'drift') {
      if (e.x < e.size * .4) { e.x = e.size * .4; e.vx = Math.abs(e.vx) * .8; e.dvx = Math.abs(e.dvx); e.sqv = 2; }
      if (e.x > W - e.size * .4) { e.x = W - e.size * .4; e.vx = -Math.abs(e.vx) * .8; e.dvx = -Math.abs(e.dvx); e.sqv = 2; }
      if (e.y < e.size * .4) { e.y = e.size * .4; e.vy = Math.abs(e.vy) * .8; e.dvy = Math.abs(e.dvy); e.sqv = 2; }
      if (e.y > H - e.size * .4) { e.y = H - e.size * .4; e.vy = -Math.abs(e.vy) * .8; e.dvy = -Math.abs(e.dvy); e.sqv = 2; }
    } else if (e.x < -m * 2 || e.x > W + m * 2 || e.y < -m * 2 || e.y > H + m * 2 ||
      (wall && S.flow === 'h' && ((e.dir > 0 && e.x > W + m) || (e.dir < 0 && e.x < -m))) ||
      (wall && S.flow === 'up' && e.y < -m) || (wall && S.flow === 'rain' && e.y > H + m) ||
      (!wall && e.y < -m)) {
      if (wall && ents.length > targetCount()) { e.dead = true; continue; }   // 召唤出来的临时团团飘走后消失
      detachProps(e);
      e.id = (Math.random() * imgs.length) | 0; assign(e, false); respawn(e, false);
    }
  }
  // 团团之间软碰撞（只在壁纸模式）
  if (wall) for (let i = 0; i < ents.length; i++) for (let j = i + 1; j < ents.length; j++) {
    const a = ents[i], b = ents[j]; if (a.grab != null && b.grab != null) continue;
    const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, r = (a.size + b.size) * .36;
    if (d2 < r * r && d2 > 1) {
      const d = Math.sqrt(d2), p = (r - d) / d * .5, f = 60 * dt * (r - d);
      if (a.grab == null) { a.x -= dx * p * .6; a.y -= dy * p * .6; a.vx -= dx / d * f; a.vy -= dy / d * f; }
      if (b.grab == null) { b.x += dx * p * .6; b.y += dy * p * .6; b.vx += dx / d * f; b.vy += dy / d * f; }
    }
  }
  if (!game.on) { ents = ents.filter(e => !e.dead); }
  else ents = ents.filter(e => !e.dead);
  if (wall) { const n = targetCount(); if (ents.length < n) { ents.push(newEnt(false)); } }

  // 文字弹幕
  if (S.txt !== 'off' && wall) {
    const maxT = S.txt === 'many' ? 9 : 4;
    if (texts.length < maxT && Math.random() < dt * (S.txt === 'many' ? 1.2 : .5)) spawnText(pick(DANMU));
  }
  for (const t of texts) { t.x += t.vx * dt; t.y += t.vy * dt; t.age += dt; }
  texts = texts.filter(t => t.style === 'vertical' ? t.y < H + 40 : t.x > -t.w - 60);
  updateProps(dt); Music.update(dt);
  // 粒子
  for (const p of parts) { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.grav == null ? 500 : p.grav) * dt; p.vx *= .985; p.rot += p.vr * dt; }
  parts = parts.filter(p => p.life < p.max);
  // 背景星光
  for (const s of stars) { s.y -= s.v * dt; s.x += Math.sin(T * s.f + s.p) * 8 * dt; if (s.y < -20) { s.y = H + 20; s.x = rnd(0, W); } }
  idleT += dt; if (idleT > 5 && !panelOpen()) hideDock();
}

/* ---------- 绘制 ---------- */
function drawBg() {
  const th = THEMES[S.theme], c = th.bg, a = bgPhase * Math.PI * 2;
  const g = ctx.createLinearGradient(W / 2 + Math.cos(a) * W * .7, H / 2 + Math.sin(a) * H * .7, W / 2 - Math.cos(a) * W * .7, H / 2 - Math.sin(a) * H * .7);
  c.forEach((col, i) => g.addColorStop(i / (c.length - 1), col));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // 柔光斑
  for (const s of stars) {
    const tw = .5 + .5 * Math.sin(T * s.f * 2 + s.p);
    ctx.globalAlpha = s.a * (.4 + tw * .6); ctx.fillStyle = S.theme === 'night' ? '#fff' : '#fff';
    if (s.kind === 0) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); }
    else { ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(T * .3 + s.p); starPath(ctx, s.r * .9, 4, .3); ctx.fill(); ctx.restore(); }
  }
  ctx.globalAlpha = 1;
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
/* 画单个字：outline=深色外描边，border=白色贴纸边，fill=字色 */
function paintChar(ch, fill, o = {}) {
  const fs = o.fs;
  ctx.textAlign = 'center';
  if (o.shadow) { ctx.fillStyle = o.shadow; ctx.fillText(ch, fs * .07, fs * .09); }
  if (o.outline) { ctx.lineWidth = fs * (o.ow || .26); ctx.strokeStyle = o.outline; ctx.strokeText(ch, 0, 0); }
  if (o.border) { ctx.lineWidth = fs * .15; ctx.strokeStyle = o.border; ctx.strokeText(ch, 0, 0); }
  ctx.fillStyle = fill; ctx.fillText(ch, 0, 0);
}
function drawTexts(back) {
  for (const t of texts) if ((t.style === 'giant') === !!back) drawText(t);
}
function drawText(t) {
  const fs = t.fs, chars = t.chars, st = t.style, n = chars.length;
  ctx.save();
  ctx.font = `900 ${fs}px ${t.family}, "Microsoft YaHei", sans-serif`;
  ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const widths = chars.map(c => ctx.measureText(c).width);
  const vert = st === 'vertical', gap = fs * .03;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (n - 1);
  t.w = vert ? fs * 1.4 : total + (st === 'stamp' ? fs : 0); t.h = vert ? fs * 1.1 * n : fs * 1.3;
  ctx.translate(t.x, t.y + Math.sin(T * 1.6 + t.ph) * fs * .08);
  ctx.rotate(t.tilt + Math.sin(T * 1.2 + t.ph) * .03 + (st === 'shake' ? (hash(Math.floor(T * 14) + t.ph) - .5) * .08 : 0));
  const DK = '#3a2a5c';

  if (st === 'stamp') {   // 盖章/贴纸标签
    ctx.fillStyle = 'rgba(255,255,255,.88)'; roundRect(ctx, -fs * .15, -fs * .7, total + fs * 1.3, fs * 1.4, fs * .3); ctx.fill();
    ctx.setLineDash([fs * .22, fs * .14]); ctx.lineWidth = fs * .09; ctx.strokeStyle = t.color; ctx.stroke(); ctx.setLineDash([]);
    ctx.translate(fs * .5, 0);
  }
  if (st === 'neon') ctx.globalAlpha = (hash(Math.floor(T * 9) + t.ph) > .9) ? .55 : 1;
  if (st === 'giant') ctx.globalAlpha = .9;

  let x = 0;
  for (let i = 0; i < n; i++) {
    const ch = chars[i], w = widths[i], j = t.jit[i];
    let cx = x + w / 2, cy = 0, rot = 0, sc = 1;
    if (vert) { cx = Math.sin(T * 2 + i * .6) * fs * .12; cy = i * fs * 1.08; }
    ctx.save();
    switch (st) {
      case 'jelly': cy = Math.sin(T * 3 + i * .5) * fs * .05; rot = j * .12; break;
      case 'wave': cy = Math.sin(T * 4 + i * .7) * fs * .28; rot = Math.cos(T * 4 + i * .7) * .12; break;
      case 'shake': { const sd = Math.floor(T * 16) + i * 7.3 + t.ph; cx += (hash(sd) - .5) * fs * .14; cy = (hash(sd + 3) - .5) * fs * .14; rot = (hash(sd + 9) - .5) * .4; sc = 1 + .08 * Math.sin(T * 20); break; }
      case 'bounce': { const b = Math.max(0, Math.sin(T * 5 - i * .55)); sc = 1 + .45 * b; cy = -b * fs * .22; rot = j * .15; break; }
      case 'giant': sc = 1 + Math.sin(T * 1.4 + i) * .03; break;
      case 'vertical': rot = j * .15; break;
    }
    ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
    switch (st) {
      case 'jelly': paintChar(ch, t.color, { fs, outline: DK, border: '#fff' }); break;
      case 'wave': paintChar(ch, RAINBOW[(i + Math.floor(T * 3)) % 6], { fs, outline: DK, border: '#fff' }); break;
      case 'shake': paintChar(ch, i % 2 ? '#ff2f6f' : '#ffe14a', { fs, outline: DK, border: '#fff', ow: .3 }); break;
      case 'giant': ctx.fillStyle = 'rgba(255,255,255,.26)'; ctx.textAlign = 'center'; ctx.fillText(ch, 0, 0); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.strokeText(ch, 0, 0); break;
      case 'grad': {
        const g = ctx.createLinearGradient(-cx, 0, total - cx, 0); g.addColorStop(0, t.color); g.addColorStop(.5, t.color2); g.addColorStop(1, t.color3);
        paintChar(ch, g, { fs, outline: DK, ow: .16, shadow: 'rgba(58,42,92,.35)' }); break;
      }
      case 'bounce': paintChar(ch, RAINBOW[(i * 2) % 6], { fs, outline: DK, border: '#fff' }); break;
      case 'vertical': paintChar(ch, i % 2 ? t.color : t.color2, { fs, outline: DK, border: '#fff' }); break;
      case 'neon':
        ctx.shadowColor = t.color; ctx.shadowBlur = fs * .7; ctx.lineWidth = fs * .1; ctx.strokeStyle = t.color; ctx.textAlign = 'center'; ctx.strokeText(ch, 0, 0); ctx.strokeText(ch, 0, 0);
        ctx.shadowBlur = fs * .2; ctx.fillStyle = '#fff'; ctx.fillText(ch, 0, 0); break;
      case 'stamp': ctx.textAlign = 'center'; ctx.fillStyle = t.color; ctx.fillText(ch, 0, 0); break;
    }
    ctx.restore();
    x += w + gap;
  }
  ctx.restore();
}
function drawEnt(e) {
  const sp = e.sprite, k = e.size / Math.max(sp.width - 36, sp.height - 36);
  let pop = 1;
  if (e.spawnAnim) { const a = e.spawnAnim; pop = a < 1 ? 1 - Math.pow(1 - a, 3) * Math.cos(a * 9) : 1; }
  const breathe = Math.sin(T * 2.2 + e.ph) * .03;
  const sx = k * pop * (1 + e.sq + breathe), sy = k * pop * (1 - e.sq - breathe);
  ctx.save(); ctx.translate(e.x, e.y);
  ctx.rotate(e.rot + Math.sin(T * e.fq * .9 + e.ph) * .08);
  ctx.scale(sx, sy);
  if (e.grab != null) { ctx.scale(1.1, 1.1); }
  ctx.drawImage(sp, -sp.width / 2, -sp.height / 2);
  ctx.restore();
  // 随机闪烁的四角星
  {
    const d = entDims(e), r0 = e.rot + Math.sin(T * e.fq * .9 + e.ph) * .08;
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(r0);
    for (const tw of e.tw) {
      const kk = .5 + .5 * Math.sin(T * tw.f + tw.ph); if (kk < .35) continue;
      const rr = e.size * .075 * tw.s * kk * kk * pop;
      const x = Math.cos(tw.a) * d.w * .5 * tw.r, y = Math.sin(tw.a) * d.h * .5 * tw.r;
      sparkle4(x, y, rr * 1.6, 'rgba(255,230,120,.55)'); sparkle4(x, y, rr, '#fff');
    }
    ctx.restore();
  }
  if (e.say) {
    const t = e.say.t, a = t < .15 ? t / .15 : t > 1.8 ? Math.max(0, (2.2 - t) / .4) : 1;
    const fs = clamp(e.size * .2, 16, 26);
    ensureFont(BUBBLE_FONT, e.say.text);
    ctx.save(); ctx.globalAlpha = a; ctx.font = `900 ${fs}px ${BUBBLE_FONT},sans-serif`;
    const tw = ctx.measureText(e.say.text).width + fs * 1.3, bh = fs * 1.9;
    const bx = e.x - tw / 2, by = e.y - e.size * .62 - bh - (1 - Math.min(1, t / .15)) * -10;
    ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(90,50,140,.25)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    roundRect(ctx, bx, by, tw, bh, bh / 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(e.x - 7, by + bh - 1); ctx.lineTo(e.x + 7, by + bh - 1); ctx.lineTo(e.x, by + bh + 9); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.fillStyle = '#4b3a73'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(e.say.text, e.x, by + bh / 2 + 1);
    ctx.restore();
  }
}
/* ---------- 饰品：随机飘到团团脸上 ---------- */
let props = [], propT = 2;
function entDims(e) {
  const sp = e.sprite, k = e.size / Math.max(sp.width - 36, sp.height - 36);
  return { w: (sp.width - 36) * k, h: (sp.height - 36) * k };
}
function anchorOf(e, a) {
  const d = entDims(e), r = e.rot + Math.sin(T * e.fq * .9 + e.ph) * .08, lx = a.ax * d.w, ly = a.ay * d.h, c = Math.cos(r), s = Math.sin(r);
  return { x: e.x + lx * c - ly * s, y: e.y + lx * s + ly * c, rot: r + (a.rot || 0), w: d.w };
}
function spawnProp() {
  const cands = ents.filter(e => !e.dead && !e.props.length && e.grab == null && e.x > 0 && e.x < W && e.y > 0 && e.y < H && !e.spawnAnim);
  if (!cands.length) return;
  const e = pick(cands), name = pick(PropLib.names), def = PropLib.defs[name];
  const th = THEMES[S.theme], f = pick(th.fills), cols = { a: f[0], b: f[1] };
  const side = (Math.random() * 4) | 0, m = 120;
  const sx = side === 0 ? -m : side === 1 ? W + m : rnd(0, W), sy = side === 2 ? -m : side === 3 ? H + m : rnd(0, H);
  const anchors = def.pair ? def.pair : [def];
  for (const a of anchors) {
    const p = { name, def, a, spr: PropLib.make(name, cols), ent: e, x: sx + rnd(-30, 30), y: sy + rnd(-30, 30), rot: rnd(-3, 3), sc: .3, state: 'fly',
      t: 0, wt: 0, life: rnd(5.5, 10), ph: rnd(0, 7), alpha: 1, size: 60, say: a === anchors[0] };
    props.push(p); e.props.push(p);
  }
}
function detachProps(e) { for (const p of e.props) if (p.state !== 'leave') leaveProp(p); e.props = []; }
function leaveProp(p) { p.state = 'leave'; p.lt = 0; p.vx = rnd(-70, 70); p.vy = -rnd(90, 170); p.vr = rnd(-3, 3); }
function updateProps(dt) {
  if (S.mode !== 'wall') return;
  if (S.props !== 'off') {
    propT -= dt;
    if (propT <= 0) {
      const many = S.props === 'many', maxEnts = many ? 7 : 3;
      if (ents.filter(e => e.props.length).length < maxEnts) spawnProp();
      propT = many ? rnd(.6, 1.5) : rnd(1.6, 3.4);
    }
  }
  for (const p of props) {
    p.t += dt; const e = p.ent;
    if (p.state !== 'leave') p.size = p.def.s * entDims(e).w;
    if (p.state === 'fly') {
      const tg = anchorOf(e, p.a), dx = tg.x - p.x, dy = tg.y - p.y, d = Math.hypot(dx, dy), k = 1 - Math.exp(-dt * 2.6);
      p.x += dx * k + Math.cos(p.t * 5 + p.ph) * Math.min(d, 220) * dt * .9; p.y += dy * k + Math.sin(p.t * 6 + p.ph) * Math.min(d, 220) * dt * .9;
      p.rot = tg.rot + Math.sin(p.t * 5) * Math.min(d / 220, 1.2);
      p.sc = Math.min(1, .35 + p.t * .9);
      if (Math.random() < dt * 14) sparkle(p.x, p.y);
      if (e.dead || p.t > 9) leaveProp(p);
      else if (d < Math.max(14, e.size * .09)) {
        p.state = 'worn'; p.wt = 0;
        if (p.say) { e.sqv += 6; e.say = { text: pick(p.def.say), t: 0 }; burst(p.x, p.y, 10, ['#fff', '#ffe27a', '#ffb3d9', '#b5e8ff'], 'star'); beep((Math.random() * 8) | 0, .08); }
      }
    } else if (p.state === 'worn') {
      const tg = anchorOf(e, p.a); p.wt += dt;
      p.x = tg.x; p.y = tg.y; p.rot = tg.rot + Math.sin(T * 3 + p.ph) * .05;
      p.sc = 1 + Math.exp(-p.wt * 6) * .5 * Math.cos(p.wt * 18);
      if (Math.random() < dt * 2.5) sparkle(p.x + rnd(-p.size * .3, p.size * .3), p.y + rnd(-p.size * .3, p.size * .3));
      if (p.wt > p.life || e.dead) { leaveProp(p); }
    } else {   // leave
      p.lt += dt; p.vy -= 40 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.alpha = 1 - p.lt / 1.3;
      if (Math.random() < dt * 12) sparkle(p.x, p.y);
    }
  }
  props = props.filter(p => !(p.state === 'leave' && p.alpha <= 0));
  for (const e of ents) e.props = e.props.filter(p => props.includes(p) && p.state !== 'leave');
}
function drawProp(p) {
  const s = p.size * p.sc;
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, p.alpha);
  ctx.shadowColor = 'rgba(90,50,140,.3)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.drawImage(p.spr, -s / 2, -s / 2, s, s);
  ctx.restore();
}
function sparkle4(x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
}
function drawParts() {
  for (const p of parts) {
    const a = 1 - p.life / p.max; ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.6); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    const s = p.size * (p.type === 'text' ? 1 : (.5 + a * .5));
    ctx.fillStyle = p.color;
    if (p.type === 'heart') { heartPath(ctx, s * .8); ctx.fill(); }
    else if (p.type === 'star') { starPath(ctx, s); ctx.fill(); }
    else if (p.type === 'text') { ctx.font = `900 ${s}px "Varela Round",sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.strokeText(p.text, 0, 0); ctx.fillText(p.text, 0, 0); }
    else { ctx.beginPath(); ctx.arc(0, 0, s * .4, 0, 7); ctx.fill(); }
    ctx.restore();
  }
}
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawBg(); drawTexts(true);
  for (const e of ents) { drawEnt(e); for (const p of e.props) if (p.state === 'worn') drawProp(p); }
  for (const p of props) if (p.state !== 'worn') drawProp(p);
  drawTexts(false);
  drawParts();
}
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
  update(dt); render(); requestAnimationFrame(loop);
}

/* ---------- UI ---------- */
let toastT = 0;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 1800); }
function showCard(html) { const c = $('#card'); c.innerHTML = html; c.classList.add('show'); }
function hideCard() { $('#card').classList.remove('show'); }
const panelOpen = () => $('#panel').classList.contains('open');
function closePanel() { $('#panel').classList.remove('open'); }
function closePanelIfOutside() { closePanel(); }
function showDock() { $('#dock').classList.remove('hide'); }
function hideDock() { $('#dock').classList.add('hide'); }

function buildUI() {
  const mkChips = (host, items, cur, cb) => {
    const el = $(host); el.innerHTML = '';
    items.forEach(([v, label]) => {
      const b = document.createElement('button'); b.className = 'chip' + (v === cur() ? ' sel' : ''); b.textContent = label;
      b.onclick = () => { cb(v); [...el.children].forEach(c => c.classList.remove('sel')); b.classList.add('sel'); };
      el.appendChild(b);
    });
  };
  mkChips('#themes', Object.entries(THEMES).map(([k, t]) => [k, t.name]), () => S.theme, v => { S.theme = v; store.set('theme', v); for (const e of ents) assign(e, e.rainbow); toast('换新衣服啦！'); });
  mkChips('#flows', [['h', '➡️ 横向弹幕'], ['up', '🫧 向上飘'], ['rain', '🌧 掉落'], ['drift', '🛋 漫游']], () => S.flow, v => { S.flow = v; store.set('flow', v); ents = []; props = []; fillEnts(true); });
  mkChips('#propOpt', [['off', '关闭'], ['on', '偶尔'], ['many', '很多']], () => S.props, v => { S.props = v; store.set('props', v); if (v === 'off') for (const e of ents) detachProps(e); });
  mkChips('#txtOpt', [['off', '关闭'], ['on', '少量'], ['many', '满屏']], () => S.txt, v => { S.txt = v; store.set('txt', v); if (v === 'off') texts = []; });
  const den = $('#den'), spd = $('#spd');
  den.value = S.density || targetCount(); $('#vDen').textContent = den.value;
  den.oninput = () => { S.density = +den.value; $('#vDen').textContent = den.value; store.set('density', S.density); if (S.mode === 'wall') fillEnts(true); };
  spd.value = S.speed; $('#vSpd').textContent = S.speed + 'x';
  spd.oninput = () => { S.speed = +spd.value; $('#vSpd').textContent = S.speed.toFixed(1) + 'x'; store.set('speed', S.speed); };
  const send = () => {
    const i = $('#msg'), v = i.value.trim(); if (!v) return;
    spawnText(v, true); i.value = ''; burst(W - 40, H / 2, 12); beep(4); closePanel();
    for (let k = 0; k < 2; k++) summon(rnd(W * .2, W * .8), H + 20);
  };
  $('#sendBtn').onclick = send; $('#msg').onkeydown = e => { if (e.key === 'Enter') send(); };
  $('#closeP').onclick = closePanel;
  $('#bSet').onclick = e => { e.stopPropagation(); $('#panel').classList.toggle('open'); };
  $('#bGame').onclick = () => {
    if (S.mode === 'game') { toWall(); return; }
    showCard(`<h2>🫧 戳泡泡</h2><p>团团会从下面飘上来～<br>30 秒内尽量多戳！<br>连击越多分数越高，<br><b>彩虹团团</b>奖励 +5 分并加时间</p>
      <button class="big" id="go">开始！</button><p style="margin:14px 0 0"><span id="cc" style="cursor:pointer;text-decoration:underline">先不玩了</span></p>`);
    $('#go').onclick = startGame; $('#cc').onclick = hideCard; closePanel();
  };
  /* ---- 背景音乐 ---- */
  const renderMusic = () => {
    const host = $('#musicTracks'); host.innerHTML = '';
    Music.tracks.forEach((t, i) => {
      const b = document.createElement('button'); b.className = 'chip' + (i === Music.current() ? ' sel' : ''); b.textContent = `${t.emoji} ${t.title}`;
      b.onclick = () => { Music.select(i); store.set('mtrack', t.id); if (!Music.isPlaying()) { Music.play(); store.set('mon', true); } };
      host.appendChild(b);
    });
    $('#mPlay').textContent = Music.isPlaying() ? '⏸ 暂停' : '▶ 播放';
    $('#bMusic').classList.toggle('on', Music.isPlaying());
  };
  Music.onChange = renderMusic;
  Music.loadPlaylist().then(() => { Music.selectById(store.get('mtrack', 'candy')); renderMusic(); });
  Music.setVol(store.get('mvol', .6)); $('#mVol').value = store.get('mvol', .6);
  $('#mVol').oninput = e => { Music.setVol(+e.target.value); store.set('mvol', +e.target.value); };
  $('#mPlay').onclick = () => { Music.toggle(); store.set('mon', Music.isPlaying()); };
  $('#bMusic').onclick = () => { Music.toggle(); store.set('mon', Music.isPlaying()); toast(Music.isPlaying() ? '🎵 ' + Music.tracks[Music.current()].title : '音乐已暂停'); };
  $('#mNext').onclick = () => { Music.next(); store.set('mtrack', Music.tracks[Music.current()].id); if (!Music.isPlaying()) { Music.play(); store.set('mon', true); } };
  $('#mAdd').onclick = () => $('#mFile').click();
  $('#mFile').onchange = e => { Music.addFiles(e.target.files); toast('已添加 ' + e.target.files.length + ' 首（仅本次有效，想长期保留请放进 music 文件夹）'); };
  Music.onBeat = s => {   // 团团跟着节拍弹跳
    if (S.mode !== 'wall') return;
    for (const e of ents) if (e.grab == null) e.sqv += (1.2 + Math.random() * 1.4) * s;
    if (s >= .9 && Math.random() < .35 && ents.length) { const e = pick(ents); burst(e.x, e.y - e.size * .3, 3, null, 'heart'); }
  };
  // 浏览器要求用户操作后才能出声：上次开着音乐的话，第一次点击页面时自动续播
  addEventListener('pointerdown', () => { if (store.get('mon', false) && !Music.isPlaying()) Music.play(); }, { once: true, capture: true });
  renderMusic();
  const updSound = () => { $('#bSound').textContent = S.sound ? '🔔' : '🔕'; $('#bSound').classList.toggle('on', S.sound); };
  $('#bSound').onclick = () => { S.sound = !S.sound; store.set('sound', S.sound); updSound(); beep(3); };
  updSound();
  $('#bFull').onclick = async () => {
    try {
      if (!document.fullscreenElement) { await document.documentElement.requestFullscreen(); try { navigator.wakeLock && (await navigator.wakeLock.request('screen')); } catch (e) {} }
      else await document.exitFullscreen();
    } catch (e) { toast('此设备不支持全屏，可"添加到主屏幕"'); }
  };
  $('#bShot').onclick = () => {
    closePanel(); render();
    try {
      cvs.toBlob(b => {
        if (!b) return toast('保存失败');
        const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `团团壁纸_${Date.now()}.png`; a.click();
        toast('已保存当前画面 📷');
      }, 'image/png');
    } catch (e) { toast('请通过 http 打开才能保存图片'); }
  };
  ['pointerdown', 'pointermove'].forEach(n => $('#panel').addEventListener(n, e => e.stopPropagation()));
  $('#dock').addEventListener('pointerdown', e => e.stopPropagation());
  addEventListener('pointerdown', e => { if (!e.target.closest('#panel') && !e.target.closest('#dock')) closePanel(); }, true);
}

function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
  cvs.width = W * DPR; cvs.height = H * DPR;
  stars.length = 0;
  const n = clamp(Math.round(W * H / 22000), 20, 70);
  for (let i = 0; i < n; i++) stars.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(2, 7), v: rnd(6, 24), f: rnd(.5, 1.5), p: rnd(0, 7), a: rnd(.25, .7), kind: Math.random() < .35 ? 1 : 0 });
}
addEventListener('resize', () => { resize(); for (const e of ents) e.size = baseSize() * e.sc; });

/* ---------- 启动 ---------- */
function loadImg(src) { return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
(async function init() {
  resize();
  const pad = n => String(n).padStart(2, '0');
  const list = await Promise.all(Array.from({ length: COUNT }, async (_, i) => ({ ink: await loadImg(`stickers/${pad(i)}_ink.png`), fill: await loadImg(`stickers/${pad(i)}_fill.png`) })));
  list.forEach(o => { if (o.ink && o.fill) imgs.push(o); });
  if (!imgs.length) { $('#loading').innerHTML = '<div>找不到 stickers 文件夹，请先运行 extract.py</div>'; return; }
  window.COUNT_REAL = imgs.length; 
  // 链接直达：index.html#night,rain 或 #game
  location.hash.slice(1).split(',').forEach(k => { if (THEMES[k]) S.theme = k; if (['h', 'up', 'rain', 'drift'].includes(k)) S.flow = k; if (k === 'many') { S.props = 'many'; S.txt = 'many'; } });
  buildUI(); fillEnts(true);
  if (location.hash.includes('game')) setTimeout(() => { startGame(); }, 100);
  { const m = location.hash.match(/music(\d)/); if (m) { Music.select(+m[1]); Music.play(); } }
  if (location.hash.includes('boom')) setTimeout(() => { shake(); for (let i = 0; i < 6; i++) summon(rnd(100, W - 100), rnd(100, H - 100), true); }, 100);
  for (let i = 0; i < 3; i++) setTimeout(() => spawnText(pick(DANMU)), i * 900);
  if (location.hash.includes('ff')) { for (let i = 0; i < 340; i++) { if (i % 20 === 0) spawnText(pick(DANMU)); update(.05); } }   // 调试：快进模拟 17 秒
  $('#loading').style.opacity = 0; setTimeout(() => $('#loading').remove(), 700);
  requestAnimationFrame(t => { last = t; loop(t); });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
})();

