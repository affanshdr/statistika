import os
from PIL import Image, ImageDraw, ImageFont

art_dir = r'C:\Users\Asus_i7\.gemini\antigravity\brain\fa4932e4-58a9-4892-9eb7-cf6716c2899c'

img1 = Image.open(os.path.join(art_dir, 'batal_flow_step1_modal_open.png')).convert('RGB')
img2 = Image.open(os.path.join(art_dir, 'batal_flow_step2_auto_exit_hallway.png')).convert('RGB')

w, h = 800, 450
img1 = img1.resize((w, h), Image.Resampling.LANCZOS)
img2 = img2.resize((w, h), Image.Resampling.LANCZOS)

pad = 20
banner_h = 75
canvas_w = w * 2 + pad * 3
canvas_h = h + pad * 2 + banner_h

canvas = Image.new('RGB', (canvas_w, canvas_h), (20, 14, 10))
draw = ImageDraw.Draw(canvas)

try:
    font_title = ImageFont.truetype('arialbd.ttf', 24)
    font_sub = ImageFont.truetype('arial.ttf', 14)
    font_label = ImageFont.truetype('arialbd.ttf', 15)
except Exception:
    font_title = font_sub = font_label = ImageFont.load_default()

draw.text((pad, 14), 'ALUR BARU: KLIK BATAL DI KUIS KELAS OTOMATIS KELUAR KE LORONG', fill=(245, 158, 11), font=font_title)
draw.text((pad, 46), 'Menghilangkan kebingungan pemain: Sekali klik "<- Batal", pemain langsung kembali ke luar kelas (lorong).', fill=(220, 200, 175), font=font_sub)

coords = [
    (pad, banner_h + pad),
    (pad * 2 + w, banner_h + pad)
]

images = [img1, img2]
labels = [
    '1. Pemain berada di Kuis Kelas & Menekan [ <- Batal ]',
    '2. Otomatis Keluar ke Lorong di Depan Pintu Kelas (Bebas Memilih Kelas Lain)'
]

for (x, y), img, label in zip(coords, images, labels):
    canvas.paste(img, (x, y))
    draw.rectangle([x, y, x + w, y + 32], fill=(30, 20, 15))
    draw.text((x + 12, y + 7), label, fill=(254, 243, 199), font=font_label)
    draw.rectangle([x, y, x + w, y + h], outline=(245, 158, 11), width=2)

out_path = os.path.join(art_dir, 'showcase_batal_auto_exit.png')
canvas.save(out_path, quality=95)
print('Saved collage successfully to:', out_path)
