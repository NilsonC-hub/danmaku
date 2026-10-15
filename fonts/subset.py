"""把下载的手写/艺术字体裁成 GB2312 常用字子集（woff2），并生成 fonts.css。
字体均为 SIL OFL 开源授权（Google Fonts），可自由随作品分发。"""
import os, glob
from fontTools import subset

d = os.path.dirname(__file__)
# GB2312 全部汉字 + ASCII + 常用标点/全角符号
chars = set(chr(c) for c in range(0x20, 0x7f))
for hi in range(0xB0, 0xF8):
    for lo in range(0xA1, 0xFF):
        try:
            chars.add(bytes([hi, lo]).decode('gb2312'))
        except Exception:
            pass
chars |= set('，。！？、；：“”‘’（）【】《》…—～·　～♡♥')
FAM = {
    'ZCOOLKuaiLe': 'ZCOOL KuaiLe', 'ZCOOLQingKeHuangYou': 'ZCOOL QingKe HuangYou', 'MaShanZheng': 'Ma Shan Zheng',
    'ZhiMangXing': 'Zhi Mang Xing', 'LiuJianMaoCao': 'Liu Jian Mao Cao', 'LongCang': 'Long Cang',
}
css = ['/* 本地字体子集（SIL OFL）。由 subset.py 生成 */']
for ttf in sorted(glob.glob(os.path.join(d, '*.ttf'))):
    name = os.path.splitext(os.path.basename(ttf))[0]
    if name not in FAM:
        continue
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.notdef_outline = True
    f = subset.load_font(ttf, opts)
    s = subset.Subsetter(opts); s.populate(text=''.join(chars)); s.subset(f)
    out = os.path.join(d, name + '.woff2'); subset.save_font(f, out, opts)
    print(name, os.path.getsize(out) // 1024, 'KB')
    css.append(f'@font-face{{font-family:"{FAM[name]}";src:url("{name}.woff2") format("woff2");font-display:swap;}}')
open(os.path.join(d, 'fonts.css'), 'w', encoding='utf-8').write('\n'.join(css) + '\n')
