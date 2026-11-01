import sys, subprocess, math
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
W, H = 1920, 1060
iw, ih = im.size
FPS, HALF = 30, 12  # 12 s aller, 12 s retour = boucle parfaite
N = FPS * HALF
def ease(t): return 0.5 - 0.5*math.cos(math.pi*t)
frames = []
p = subprocess.Popen(["ffmpeg","-y","-loglevel","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-",
    "-c:v","libx264","-preset","slow","-crf","23","-pix_fmt","yuv420p","-movflags","+faststart","-an",out], stdin=subprocess.PIPE)
def frame(t):
    e = ease(t)
    z = 1.0 + 0.08*e                      # avance (zoom)
    cw, ch = iw/z, (iw/z)*H/W
    if ch > ih: ch = ih; cw = ih*W/H
    cx = iw*(0.50 + 0.025*e)               # léger déport vers la droite
    cy = ih*(0.55 - 0.03*e)               # et vers l'horizon
    x0 = min(max(cx-cw/2,0), iw-cw); y0 = min(max(cy-ch/2,0), ih-ch)
    sx, sy = cw/W, ch/H
    return im.transform((W,H), Image.AFFINE, (sx,0,x0, 0,sy,y0), resample=Image.BICUBIC)
seq = [i/(N-1) for i in range(N)]
for t in seq + seq[::-1][1:-1]:
    p.stdin.write(frame(t).tobytes())
p.stdin.close(); p.wait()
