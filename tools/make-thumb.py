"""카드 썸네일 만들기: 16:9로 잘라 640x360 JPG로 저장한다. Pillow가 필요하다.

사용법:
  python tools/make-thumb.py 원본.png media/thumbs/이름.jpg
  python tools/make-thumb.py 원본.jpg media/thumbs/이름.jpg --box 862,168,1920,888  # 이 영역만 먼저 자름
  python tools/make-thumb.py 원본.png media/thumbs/이름.jpg --top 0                 # 세로로 길면 위쪽 기준으로 자름
"""
import argparse

from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument("source")
parser.add_argument("output")
parser.add_argument("--box", help="left,top,right,bottom")
parser.add_argument("--top", type=float, default=0.5, help="0=위쪽 1=아래쪽")
args = parser.parse_args()

image = Image.open(args.source).convert("RGB")
if args.box:
    image = image.crop(tuple(int(v) for v in args.box.split(",")))

width, height = 640, 360
source_w, source_h = image.size
if source_w / source_h > width / height:
    crop_w = int(source_h * width / height)
    left = (source_w - crop_w) // 2
    image = image.crop((left, 0, left + crop_w, source_h))
else:
    crop_h = int(source_w * height / width)
    top = int((source_h - crop_h) * args.top)
    image = image.crop((0, top, source_w, top + crop_h))

image.resize((width, height), Image.LANCZOS).save(args.output, quality=84)
print(args.output)
