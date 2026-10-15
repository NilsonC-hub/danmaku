"""用一张贴纸生成 PWA 图标"""
import cv2, numpy as np, os
d = os.path.dirname(__file__)
def rd(n): return cv2.imdecode(np.fromfile(os.path.join(d, 'stickers', n), np.uint8), cv2.IMREAD_UNCHANGED)
ink, fill = rd('16_ink.png'), rd('16_fill.png')
for S in (192, 512):
    bg = np.zeros((S, S, 3), np.float32)
    for y in range(S):  # 粉→蓝渐变
        t = y / S; bg[y, :] = np.array([232, 209, 255]) * (1 - t) + np.array([255, 235, 201]) * t
    sc = S * .72 / max(ink.shape[:2])
    f = cv2.resize(fill, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
    k = cv2.resize(ink, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
    h, w = f.shape[:2]; y0, x0 = (S - h) // 2, (S - w) // 2
    roi = bg[y0:y0 + h, x0:x0 + w]
    fa = f[..., 3:4] / 255.0
    roi[:] = roi * (1 - fa) + np.array([150, 190, 255]) * fa   # BGR 粉色
    ka = k[..., 3:4] / 255.0
    roi[:] = roi * (1 - ka) + np.array([64, 33, 43]) * ka
    cv2.imencode('.png', bg.astype(np.uint8))[1].tofile(os.path.join(d, f'icon-{S}.png'))
