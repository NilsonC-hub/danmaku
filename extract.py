"""把手绘表情包素材.jpg 切成单个贴纸：
  stickers/NN_ink.png  —— 黑色线稿（透明底，alpha=墨迹深度）
  stickers/NN_fill.png —— 实心剪影（白色，含内部填充，用于上色/白边）
并输出 stickers.json（数量与尺寸）。
"""
import json, os, sys
import cv2
import numpy as np

SRC = os.path.join(os.path.dirname(__file__), "..", "表情包素材.jpg")
OUT = os.path.join(os.path.dirname(__file__), "stickers")
os.makedirs(OUT, exist_ok=True)

img = cv2.imdecode(np.fromfile(SRC, dtype=np.uint8), cv2.IMREAD_COLOR)
h, w = img.shape[:2]
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# 纸张区域：亮且低饱和（背景地毯是彩色的）
paper = ((hsv[..., 1] < 60) & (gray > 150)).astype(np.uint8) * 255
paper = cv2.morphologyEx(paper, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
cnts, _ = cv2.findContours(paper, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
big = max(cnts, key=cv2.contourArea)
paper_mask = np.zeros_like(paper)
cv2.drawContours(paper_mask, [big], -1, 255, -1)
paper_mask = cv2.erode(paper_mask, np.ones((61, 61), np.uint8))  # 去掉纸边

# 去光照不均：用大核模糊估计背景
bg = cv2.medianBlur(gray, 51)
diff = cv2.subtract(bg, gray).astype(np.float32)  # 墨迹越深值越大
ink_alpha = np.clip((diff - 18) / 70.0, 0, 1)  # 软阈值
ink_alpha[paper_mask == 0] = 0
ink_bin = (ink_alpha > 0.35).astype(np.uint8) * 255

# 膨胀合并同一个角色的零散笔画（含小装饰）
def components(binimg, k):
    m = cv2.dilate(binimg, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    return cv2.connectedComponentsWithStats(m, 8)

def ok(st, mask):
    x, y, bw, bh, _ = st
    if bw < 40 or bh < 40 or bw * bh < 2500 or max(bw, bh) / min(bw, bh) > 5:
        return False
    # 墨迹密度过低 = 纸边划痕/噪点
    return (ink_bin[mask] > 0).sum() / (bw * bh) > 0.04

cands = []
n, labels, stats, _ = components(ink_bin, 15)
for i in range(1, n):
    if stats[i][2] * stats[i][3] < 2500:
        continue
    comp = (labels == i)
    # 尝试用更小的膨胀拆开粘连的多个角色
    sub = (ink_bin * comp).astype(np.uint8)
    n2, l2, s2, _ = components(sub, 7)
    parts = [(l2 == j) & comp for j in range(1, n2) if s2[j][2] >= 70 and s2[j][3] >= 70]
    if len(parts) >= 2 and stats[i][2] * stats[i][3] > 40000:
        # 小碎片（装饰）并入最近的大块
        rest = comp.copy()
        for pm in parts:
            rest &= ~pm
        merged_parts = [pm.copy() for pm in parts]
        n3, l3, _, _ = components((ink_bin * rest).astype(np.uint8), 7)
        for j in range(1, n3):
            frag = (l3 == j) & rest
            ys_, xs_ = np.where(frag)
            if len(xs_) == 0:
                continue
            cx, cy = xs_.mean(), ys_.mean()
            best, bd = 0, 1e9
            for pi, pm in enumerate(parts):
                py, px = np.where(pm)
                d = ((px - cx) ** 2 + (py - cy) ** 2).min()
                if d < bd:
                    bd, best = d, pi
            if bd < 60 ** 2:
                merged_parts[best] |= frag
        for pm in merged_parts:
            ys_, xs_ = np.where(pm)
            st = (xs_.min(), ys_.min(), xs_.max() - xs_.min() + 1, ys_.max() - ys_.min() + 1, 0)
            if ok(st, pm):
                cands.append(pm)
    else:
        if ok(tuple(stats[i]), comp):
            cands.append(comp)

items = []
PAD = 14
for comp in cands:
    # 只取该分量内的原始墨迹
    a = np.where(comp, ink_alpha, 0).astype(np.float32)
    # 剪影：墨迹闭运算后填洞
    sil = ((a > 0.3) & comp).astype(np.uint8) * 255
    sil = cv2.morphologyEx(sil, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21)))
    cs, _ = cv2.findContours(sil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    filled = np.zeros_like(sil)
    cv2.drawContours(filled, cs, -1, 255, -1)

    # 裁切
    ys, xs = np.where(filled > 0)
    x0, x1 = max(xs.min() - PAD, 0), min(xs.max() + PAD, w)
    y0, y1 = max(ys.min() - PAD, 0), min(ys.max() + PAD, h)
    ink_crop = (a[y0:y1, x0:x1] * 255).astype(np.uint8)
    fill_crop = filled[y0:y1, x0:x1]

    # 统一缩放到最长边 360，减小体积
    ch, cw = ink_crop.shape
    s = 360 / max(ch, cw)
    nw, nh = max(int(cw * s), 1), max(int(ch * s), 1)
    ink_r = cv2.resize(ink_crop, (nw, nh), interpolation=cv2.INTER_AREA)
    fill_r = cv2.resize(fill_crop, (nw, nh), interpolation=cv2.INTER_AREA)
    # 加强墨迹对比，让线条更黑更清晰
    ink_r = np.clip(ink_r.astype(np.float32) * 1.35, 0, 255).astype(np.uint8)

    ink_rgba = np.zeros((nh, nw, 4), np.uint8)
    ink_rgba[..., 3] = ink_r  # RGB=0 黑色
    fill_rgba = np.full((nh, nw, 4), 255, np.uint8)
    fill_rgba[..., 3] = fill_r
    items.append((y0, x0, ink_rgba, fill_rgba, nw, nh))

items.sort(key=lambda t: (t[0] // 150, t[1]))  # 大致按阅读顺序
meta = []
for idx, (_, _, ink_rgba, fill_rgba, nw, nh) in enumerate(items):
    cv2.imencode(".png", ink_rgba)[1].tofile(os.path.join(OUT, f"{idx:02d}_ink.png"))
    cv2.imencode(".png", fill_rgba)[1].tofile(os.path.join(OUT, f"{idx:02d}_fill.png"))
    meta.append({"id": idx, "w": nw, "h": nh})

with open(os.path.join(os.path.dirname(__file__), "stickers.json"), "w") as f:
    json.dump(meta, f)
print("贴纸数量:", len(meta))

# 预览总览图（检查切割效果）
cols = 10
rows = (len(meta) + cols - 1) // cols
sheet = np.full((rows * 130, cols * 130, 3), 235, np.uint8)
for m in meta:
    ink = cv2.imdecode(np.fromfile(os.path.join(OUT, f"{m['id']:02d}_ink.png"), np.uint8), cv2.IMREAD_UNCHANGED)
    fl = cv2.imdecode(np.fromfile(os.path.join(OUT, f"{m['id']:02d}_fill.png"), np.uint8), cv2.IMREAD_UNCHANGED)
    s = 120 / max(m["w"], m["h"])
    ink = cv2.resize(ink, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    fl = cv2.resize(fl, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    r, c = divmod(m["id"], cols)
    oy, ox = r * 130 + 5, c * 130 + 5
    hh, ww = ink.shape[:2]
    roi = sheet[oy:oy + hh, ox:ox + ww].astype(np.float32)
    col = np.array([200, 170, 255], np.float32)  # BGR 粉
    fa = fl[..., 3:4].astype(np.float32) / 255
    roi = roi * (1 - fa) + col * fa
    ia = ink[..., 3:4].astype(np.float32) / 255
    roi = roi * (1 - ia)
    sheet[oy:oy + hh, ox:ox + ww] = roi.astype(np.uint8)
cv2.imencode(".jpg", sheet, [cv2.IMWRITE_JPEG_QUALITY, 80])[1].tofile(os.path.join(os.path.dirname(__file__), "preview_sheet.jpg"))

