#!/usr/bin/env python3
"""build-font.py — MiSans 字体子集化（v1.9 性能 §5）

把 8.2MB 的 MiSans-Normal.ttf 裁剪为 woff2 子集，覆盖：
  1. ASCII 可打印字符 + 常用全角标点
  2. GB2312 全部汉字（一级 3,755 + 二级 3,008，共 6,763 字）
  3. 仓库 1.2/ 下实际出现的全部字符（题面/解析/界面文案，防漏字）
输出：1.2/fonts/MiSans-subset.woff2（font-display: swap + 预加载见 tokens.css / index.html）

依赖：pip install fonttools brotli
用法：python3 scripts/build-font.py
"""
import io
import os
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / '1.2' / 'fonts' / 'MiSans-Normal.ttf'
OUT = ROOT / '1.2' / 'fonts' / 'MiSans-subset.woff2'
CHARS_TXT = ROOT / '1.2' / 'fonts' / '.subset-chars.txt'

SCAN_EXT = {'.html', '.css', '.js', '.json', '.md', '.txt'}


def gb2312_chars():
    """枚举 GB2312 全部合法汉字（区 16-87，位 1-94）。"""
    out = set()
    for hi in range(0xB0, 0xF8):
        for lo in range(0xA1, 0xFF):
            try:
                ch = bytes([hi, lo]).decode('gb2312')
                out.add(ch)
            except UnicodeDecodeError:
                continue
    return out


def repo_chars():
    out = set()
    for p in (ROOT / '1.2').rglob('*'):
        if not p.is_file() or p.suffix.lower() not in SCAN_EXT:
            continue
        if p.name.startswith('.'):
            continue
        try:
            out.update(p.read_text(encoding='utf-8'))
        except (UnicodeDecodeError, OSError):
            continue
    return out


def base_chars():
    out = set()
    # ASCII 可打印
    out.update(chr(c) for c in range(0x20, 0x7F))
    # 常用全角标点 / 符号 / 数字上下标（题目里大量出现）
    out.update('　、。！？；：“”‘’（）【】《》〈〉—…·～￥％＃＆＊＋－／＝＠｜×÷±≤≥≠≈∞√∫∑π°′″℃ΩμΔαβγθλρστφω⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉→←↑↓⇌⇋△▲▼◆○●□■☆★✓✗')
    out.update('①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳')
    return out


def main():
    if not SRC.exists():
        sys.exit('缺少源字体: %s' % SRC)
    chars = base_chars() | gb2312_chars() | repo_chars()
    chars = {c for c in chars if c.isprintable() or c == '\n'}
    chars.discard('\n')
    CHARS_TXT.write_text(''.join(sorted(chars)), encoding='utf-8')
    print('字符集: %d 个' % len(chars))

    cmd = [
        sys.executable, '-m', 'fontTools.subset', str(SRC),
        '--text-file=%s' % CHARS_TXT,
        '--flavor=woff2',
        '--output-file=%s' % OUT,
        '--layout-features=*',
        '--glyph-names',
        '--symbol-cmap',
        '--legacy-cmap',
        '--notdef-glyph',
        '--notdef-outline',
        '--recommended-glyphs',
        '--name-IDs=*',
        '--name-languages=*',
        '--drop-tables+=DSIG',
    ]
    subprocess.run(cmd, check=True)
    CHARS_TXT.unlink(missing_ok=True)

    src_mb = SRC.stat().st_size / 1024 / 1024
    out_mb = OUT.stat().st_size / 1024 / 1024
    print('MiSans-Normal.ttf  %.2f MB → MiSans-subset.woff2  %.2f MB（-%d%%）'
          % (src_mb, out_mb, round((1 - out_mb / src_mb) * 100)))


if __name__ == '__main__':
    main()
