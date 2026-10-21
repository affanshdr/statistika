import os
from PIL import Image, ImageDraw, ImageFont

art_dir = r'C:\Users\Asus_i7\.gemini\antigravity\brain\fa4932e4-58a9-4892-9eb7-cf6716c2899c'

img_popup3 = Image.open(os.path.join(art_dir, 'popup_misi_selesai_updated.png')).convert('RGB')
img_map3 = Image.open(os.path.join(art_dir, 'corkboard_map_case1_3stars.png')).convert('RGB')
img_popup2 = Image.open(os.path.join(art_dir, 'popup_misi_selesai_2stars.png')).convert('RGB')
img_map2 = Image.open(os.path.join(art_dir, 'corkboard_map_case1_updated_2stars.png')).convert('RGB')

w, h = 800, 450
img_popup3 = img_popup3.resize((w, h), Image.Resampling.LANCZOS)
img_map3 = img_map3.resize((w, h), Image.Resampling.LANCZOS)
img_popup2 = img_popup2.resize((w, h), Image.Resampling.LANCZOS)
img_map2 = img_map2.resize((w, h), Image.Resampling.LANCZOS)

pad = 20
banner_h = 75
canvas_w = w * 2 + pad * 3
canvas_h = h * 2 + pad * 3 + banner_h

canvas = Image.new('RGB', (canvas_w, canvas_h), (43, 24, 16))
draw = ImageDraw.Draw(canvas)

try:
    font_title = ImageFont.truetype('arialbd.ttf', 26)
    font_sub = ImageFont.truetype('arial.ttf', 15)
    font_label = ImageFont.truetype('arialbd.ttf', 16)
except Exception:
    font_title = font_sub = font_label = ImageFont.load_default()

draw.text((pad, 14), 'PAPAN KASUS UTAMA SEKOLAH (/siswa) & INTEGRASI BINTANG DINAMIS', fill=(254, 243, 199), font=font_title)
draw.text((pad, 46), 'Lobby lama dihapus total -> Tombol [Selesai] langsung menuju Papan Kasus Corkboard dengan bintang ter-update', fill=(214, 194, 158), font=font_sub)

coords = [
    (pad, banner_h + pad),
    (pad * 2 + w, banner_h + pad),
    (pad, banner_h + pad * 2 + h),
    (pad * 2 + w, banner_h + pad * 2 + h)
]

images = [img_popup3, img_map3, img_popup2, img_map2]
labels = [
    '1. Popup \"Misi Selesai\" (Perolehan 3 Bintang - Durasi < 6 Menit)',
    '2. Papan Kasus Utama Sekolah (/siswa) - Bintang 3/3 Tampil di Kartu Case #01',
    '3. Replay Level 1 dengan Durasi Lebih Lama (Perolehan 2 Bintang - 6 s.d 10 Menit)',
    '4. Papan Kasus Ter-update Otomatis Mengikuti Run Terakhir (Bintang 2/3)'
]

for (x, y), img, label in zip(coords, images, labels):
    canvas.paste(img, (x, y))
    draw.rectangle([x, y, x + w, y + 32], fill=(43, 24, 16))
    draw.text((x + 12, y + 6), label, fill=(255, 255, 255), font=font_label)
    draw.rectangle([x, y, x + w, y + h], outline=(140, 98, 57), width=2)

out_path = os.path.join(art_dir, 'showcase_papan_kasus_bintang_dan_replay.png')
canvas.save(out_path, quality=95)
print('Saved final showcase to:', out_path)
