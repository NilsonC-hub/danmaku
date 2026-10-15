/* 饰品库：用代码画出闪闪的首饰/手机/耳机等，飘到团团脸上用 */
(() => {
'use strict';
const OL = '#3a2a5c';   // 描边色，与手绘线稿风格统一
const BOX = 200, PX = 256;

function mkc() { const c = document.createElement('canvas'); c.width = c.height = PX; const g = c.getContext('2d'); g.scale(PX / BOX, PX / BOX); g.lineJoin = 'round'; g.lineCap = 'round'; return [c, g]; }
function lin(g, a, b, x0 = 0, y0 = 0, x1 = 0, y1 = BOX) { const k = g.createLinearGradient(x0, y0, x1, y1); k.addColorStop(0, a); k.addColorStop(1, b); return k; }
function fs(g, fill, lw = 6) { g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = OL; g.stroke(); }
function heart(g, x, y, s) {
  g.beginPath(); g.moveTo(x, y + s * .35);
  g.bezierCurveTo(x - s * 1.1, y - s * .3, x - s * .45, y - s * 1.0, x, y - s * .38);
  g.bezierCurveTo(x + s * .45, y - s * 1.0, x + s * 1.1, y - s * .3, x, y + s * .35); g.closePath();
}
function star(g, x, y, r, pts = 5, inner = .5) {
  g.beginPath();
  for (let i = 0; i < pts * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / pts, rr = i % 2 ? r * inner : r; i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath();
}
function sparkle(g, x, y, r, col = '#fff') {   // 四角闪光
  g.save(); g.fillStyle = col; g.beginPath();
  g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill(); g.restore();
}
function gem(g, x, y, r, col) {   // 钻石
  g.beginPath(); g.moveTo(x - r, y - r * .25); g.lineTo(x - r * .55, y - r * .8); g.lineTo(x + r * .55, y - r * .8); g.lineTo(x + r, y - r * .25); g.lineTo(x, y + r); g.closePath();
  fs(g, col, 4);
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - r * .5, y - r * .25); g.lineTo(x, y + r * .75); g.moveTo(x + r * .5, y - r * .25); g.lineTo(x, y + r * .75); g.moveTo(x - r, y - r * .25); g.lineTo(x + r, y - r * .25); g.stroke();
  sparkle(g, x - r * .3, y - r * .5, r * .45);
}
function pearl(g, x, y, r) {
  const k = g.createRadialGradient(x - r * .3, y - r * .3, 1, x, y, r); k.addColorStop(0, '#fff'); k.addColorStop(.6, '#fdeef8'); k.addColorStop(1, '#e8c9e0');
  g.beginPath(); g.arc(x, y, r, 0, 7); fs(g, k, 3.5);
}
function glitterDots(g, n, x0, y0, x1, y1) { for (let i = 0; i < n; i++) sparkle(g, x0 + Math.random() * (x1 - x0), y0 + Math.random() * (y1 - y0), 3 + Math.random() * 4, 'rgba(255,255,255,.95)'); }
const GOLD = ['#fff3a8', '#ffc83d'];

/* ---- 各饰品绘制（200x200 坐标，中心 100,100） ---- */
const draw = {
  bow(g, c) {
    for (const s of [-1, 1]) {
      g.save(); g.translate(100, 100); g.scale(s, 1); g.translate(-100, -100);
      g.beginPath(); g.moveTo(100, 100); g.bezierCurveTo(70, 30, 12, 40, 16, 100); g.bezierCurveTo(12, 160, 70, 172, 100, 100); g.closePath();
      fs(g, lin(g, c.a, c.b, 0, 30, 100, 170)); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 4; g.beginPath(); g.moveTo(80, 90); g.quadraticCurveTo(45, 70, 32, 92); g.stroke(); g.restore();
    }
    g.beginPath(); g.ellipse(100, 100, 17, 22, 0, 0, 7); fs(g, lin(g, c.b, c.a, 80, 80, 120, 120));
    gem(g, 100, 100, 8, '#fff'); glitterDots(g, 6, 20, 50, 180, 150);
  },
  crown(g, c) {
    g.beginPath(); g.moveTo(28, 152); g.lineTo(28, 70); g.lineTo(65, 108); g.lineTo(100, 48); g.lineTo(135, 108); g.lineTo(172, 70); g.lineTo(172, 152); g.closePath(); fs(g, lin(g, GOLD[0], GOLD[1], 0, 40, 0, 160));
    g.beginPath(); g.roundRect ? g.roundRect(28, 132, 144, 26, 10) : g.rect(28, 132, 144, 26); fs(g, lin(g, GOLD[1], '#ff9f2e', 0, 130, 0, 160));
    gem(g, 100, 100, 12, c.a); gem(g, 60, 146, 7, '#7fd8f5'); gem(g, 140, 146, 7, '#ff8fb1'); gem(g, 100, 146, 7, '#fff');
    for (const [x, y] of [[28, 66], [100, 44], [172, 66]]) { g.beginPath(); g.arc(x, y, 9, 0, 7); fs(g, '#fff', 4); }
    glitterDots(g, 6, 30, 60, 170, 150);
  },
  catEars(g, c) {
    for (const s of [-1, 1]) {
      g.save(); g.translate(100, 100); g.scale(s, 1); g.translate(-100, -100);
      g.beginPath(); g.moveTo(14, 150); g.lineTo(26, 30); g.lineTo(92, 108); g.closePath(); fs(g, lin(g, c.a, c.b, 0, 30, 90, 150));
      g.beginPath(); g.moveTo(30, 128); g.lineTo(37, 62); g.lineTo(72, 108); g.closePath(); g.fillStyle = '#ffc6dc'; g.fill(); g.restore();
    }
    star(g, 100, 112, 12); fs(g, '#ffe27a', 4); sparkle(g, 40, 50, 9); sparkle(g, 165, 60, 8);
  },
  halo(g) {
    g.save(); g.shadowColor = 'rgba(255,220,100,.95)'; g.shadowBlur = 24;
    g.beginPath(); g.ellipse(100, 100, 72, 22, 0, 0, 7); g.lineWidth = 17; g.strokeStyle = OL; g.stroke();
    g.lineWidth = 9; g.strokeStyle = lin(g, '#fff6b0', '#ffc83d', 0, 80, 200, 120); g.stroke(); g.restore();
    sparkle(g, 40, 90, 10); sparkle(g, 164, 108, 8); sparkle(g, 100, 70, 7);
  },
  flower(g, c) {
    for (let i = 0; i < 6; i++) { g.save(); g.translate(100, 100); g.rotate(i / 6 * Math.PI * 2); g.beginPath(); g.ellipse(0, -42, 24, 36, 0, 0, 7); fs(g, lin(g, '#fff', c.a, 0, -80, 0, 0), 5); g.restore(); }
    g.beginPath(); g.arc(100, 100, 22, 0, 7); fs(g, lin(g, '#fff3a8', '#ffc83d', 80, 80, 120, 120), 5); sparkle(g, 94, 92, 9); gem(g, 100, 100, 0.1, '#fff');
  },
  starClip(g, c) {
    star(g, 100, 102, 80, 5, .5); fs(g, lin(g, GOLD[0], GOLD[1], 0, 20, 0, 180), 7);
    star(g, 100, 102, 38, 5, .5); g.fillStyle = c.a; g.fill();
    sparkle(g, 76, 70, 14); glitterDots(g, 4, 50, 50, 150, 150);
  },
  headphones(g, c) {
    g.beginPath(); g.arc(100, 118, 78, Math.PI * 1.04, Math.PI * 1.96); g.lineWidth = 20; g.strokeStyle = OL; g.stroke();
    g.lineWidth = 11; g.strokeStyle = lin(g, c.a, c.b, 0, 30, 200, 30); g.stroke();
    for (const x of [26, 174]) {
      g.beginPath(); g.ellipse(x, 126, 22, 34, 0, 0, 7); fs(g, lin(g, c.b, c.a, x - 20, 90, x + 20, 160));
      g.beginPath(); g.ellipse(x, 126, 11, 20, 0, 0, 7); g.fillStyle = 'rgba(255,255,255,.8)'; g.fill();
      heart(g, x, 128, 8); g.fillStyle = '#ff6fa5'; g.fill();
    }
    sparkle(g, 100, 28, 11); sparkle(g, 150, 46, 7);
  },
  earring(g, c) {
    g.beginPath(); g.arc(100, 30, 16, 0, 7); g.lineWidth = 5; g.strokeStyle = OL; g.stroke(); g.lineWidth = 2.5; g.strokeStyle = GOLD[1]; g.stroke();
    g.beginPath(); g.moveTo(100, 46); g.lineTo(100, 90); g.lineWidth = 5; g.strokeStyle = OL; g.stroke();
    gem(g, 100, 120, 36, c.a); star(g, 100, 172, 16); fs(g, '#ffe27a', 4); sparkle(g, 118, 100, 11);
  },
  heartGlasses(g, c) {
    for (const x of [58, 142]) { heart(g, x, 100, 50); g.fillStyle = 'rgba(255,255,255,.1)'; g.fill(); g.lineWidth = 10; g.strokeStyle = OL; g.stroke(); g.lineWidth = 5; g.strokeStyle = c.a; g.stroke();
      const k = g.createLinearGradient(x - 30, 60, x + 30, 130); k.addColorStop(0, 'rgba(255,255,255,.65)'); k.addColorStop(1, 'rgba(255,160,200,.35)'); heart(g, x, 100, 46); g.fillStyle = k; g.fill(); sparkle(g, x - 14, 82, 9); }
    g.beginPath(); g.moveTo(92, 92); g.quadraticCurveTo(100, 82, 108, 92); g.lineWidth = 7; g.strokeStyle = OL; g.stroke();
    g.beginPath(); g.moveTo(8, 92); g.lineTo(0, 80); g.moveTo(192, 92); g.lineTo(200, 80); g.lineWidth = 7; g.stroke();
  },
  phone(g, c) {
    // 手机壳
    g.beginPath(); g.roundRect ? g.roundRect(56, 12, 88, 168, 20) : g.rect(56, 12, 88, 168); fs(g, lin(g, c.a, c.b, 56, 12, 144, 180), 7);
    g.beginPath(); g.roundRect ? g.roundRect(66, 26, 68, 140, 10) : g.rect(66, 26, 68, 140); fs(g, lin(g, '#c8ecff', '#ffd6ec', 66, 26, 134, 166), 4);
    heart(g, 100, 92, 22); g.fillStyle = '#ff7eb6'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
    g.fillStyle = OL; g.beginPath(); g.roundRect ? g.roundRect(88, 29, 24, 6, 3) : g.rect(88, 29, 24, 6); g.fill();
    sparkle(g, 82, 58, 10); sparkle(g, 122, 136, 8); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(100, 152, 7, 0, 7); g.fill();
    for (const y of [28, 60, 92, 124, 156]) { g.beginPath(); g.arc(150, y + 6, 4.5, 0, 7); g.fillStyle = '#fff'; g.fill(); }  // 侧边亮钻
    // 手机挂绳 + 星星挂件
    g.beginPath(); g.moveTo(60, 170); g.bezierCurveTo(20, 175, 18, 195, 40, 196); g.lineWidth = 5; g.strokeStyle = OL; g.stroke(); g.lineWidth = 2.5; g.strokeStyle = '#ffc83d'; g.stroke();
    star(g, 40, 190, 12); fs(g, '#ffe27a', 3.5);
  },
  teaCup(g, c) {
    g.beginPath(); g.moveTo(52, 70); g.lineTo(148, 70); g.lineTo(136, 184); g.lineTo(64, 184); g.closePath(); fs(g, lin(g, '#fff', '#ffe9d2', 0, 70, 0, 184));
    g.beginPath(); g.moveTo(58, 120); g.lineTo(142, 120); g.lineTo(136, 184); g.lineTo(64, 184); g.closePath(); g.fillStyle = lin(g, '#d9a77a', '#b57a4e', 0, 120, 0, 184); g.fill();
    for (const [x, y] of [[80, 168], [100, 172], [120, 168], [90, 154], [110, 156]]) { g.beginPath(); g.arc(x, y, 8, 0, 7); g.fillStyle = '#4a2f2f'; g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(x - 2.5, y - 3, 2.5, 0, 7); g.fill(); }
    g.beginPath(); g.ellipse(100, 70, 54, 14, 0, 0, 7); fs(g, c.a, 6);
    g.beginPath(); g.moveTo(112, 66); g.lineTo(128, 6); g.lineWidth = 11; g.strokeStyle = OL; g.stroke(); g.lineWidth = 5; g.strokeStyle = c.b; g.stroke();
    heart(g, 100, 108, 14); g.fillStyle = '#ff7eb6'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke(); sparkle(g, 70, 98, 10);
  },
  necklace(g, c) {
    for (let i = 0; i <= 10; i++) { const t = i / 10, x = 14 + t * 172, y = 40 + Math.sin(t * Math.PI) * 78; pearl(g, x, y, 12); }
    heart(g, 100, 142, 26); fs(g, lin(g, c.a, c.b, 70, 110, 130, 170), 5); sparkle(g, 90, 130, 11); sparkle(g, 40, 100, 7);
  },
  wand(g, c) {
    g.beginPath(); g.moveTo(40, 188); g.lineTo(104, 92); g.lineWidth = 15; g.strokeStyle = OL; g.stroke(); g.lineWidth = 7; g.strokeStyle = lin(g, c.a, c.b, 40, 188, 104, 92); g.stroke();
    star(g, 120, 66, 58, 5, .5); fs(g, lin(g, GOLD[0], GOLD[1], 60, 10, 180, 120), 7);
    heart(g, 120, 68, 20); g.fillStyle = '#ff7eb6'; g.fill(); g.lineWidth = 3; g.strokeStyle = OL; g.stroke();
    sparkle(g, 160, 24, 11); sparkle(g, 76, 40, 8); sparkle(g, 168, 108, 8);
    g.beginPath(); g.moveTo(52, 170); g.quadraticCurveTo(20, 160, 18, 190); g.moveTo(52, 170); g.quadraticCurveTo(70, 196, 40, 196); g.lineWidth = 5; g.strokeStyle = c.a; g.stroke();
  }
};

/* ---- 佩戴位置：ax/ay 为相对贴纸宽/高的偏移，s 为饰品宽度占贴纸宽的比例 ---- */
const defs = {
  bow:          { ax: .27, ay: -.40, s: .46, rot: -.3,  say: ['蝴蝶结~', '甜美暴击'] },
  crown:        { ax: 0,   ay: -.52, s: .52, rot: 0,    say: ['我是公主👑', '本宫驾到'] },
  catEars:      { ax: 0,   ay: -.44, s: .98, rot: 0,    say: ['喵~', '猫猫上线'] },
  halo:         { ax: 0,   ay: -.60, s: .64, rot: 0,    say: ['天使降临', '好人一生平安'] },
  flower:       { ax: -.30, ay: -.38, s: .36, rot: .2,  say: ['花花~', '春天来啦'] },
  starClip:     { ax: .31, ay: -.30, s: .30, rot: .3,   say: ['闪闪✨', '发夹好看吗'] },
  headphones:   { ax: 0,   ay: -.04, s: 1.18, rot: 0,   say: ['听歌中🎧', '别吵我'] },
  earring:      { pair: [{ ax: -.5, ay: .10, rot: .1 }, { ax: .5, ay: .10, rot: -.1 }], s: .26, say: ['耳环好看吗', '叮叮当当'] },
  heartGlasses: { ax: 0,   ay: -.10, s: .95, rot: 0,    say: ['粉色滤镜', '看世界都是爱心'] },
  phone:        { ax: .46, ay: .32, s: .62, rot: .35,   say: ['自拍一张📱', '拍照拍照'] },
  teaCup:       { ax: -.44, ay: .34, s: .52, rot: -.2,  say: ['奶茶续命🧋', '三分糖'] },
  necklace:     { ax: 0,   ay: .50, s: .92, rot: 0,     say: ['珍珠项链✨', '优雅'] },
  wand:         { ax: .52, ay: .06, s: .85, rot: .4,    say: ['变身！✨', '魔法棒！'] }
};
const names = Object.keys(defs);

window.PropLib = {
  names, defs,
  make(name, cols) {
    const [c, g] = mkc(); draw[name](g, cols); return c;
  }
};
})();
