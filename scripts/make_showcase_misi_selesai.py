import os
from PIL import Image, ImageDraw, ImageFont

art_dir = r'C:\Users\Asus_i7\.gemini\antigravity\brain\fa4932e4-58a9-4892-9eb7-cf6716c2899c'

img_chat = Image.open(os.path.join(art_dir, 'ending_chit_chat_step3_conclusion.png')).convert('RGB')
img_popup = Image.open(os.path.join(art_dir, 'popup_misi_selesai_stars.png')).convert('RGB')
img_map = Image.open(os.path.join(art_dir, 'map_lobby_level1_stars.png')).convert('RGB')
img_map_updated = Image.open(os.path.join(art_dir, 'map_lobby_level1_updated_stars.png')).convert('RGB')

w, h = 800, 450
img_chat = img_chat.resize((w, h), Image.Resampling.LANCZOS)
img_popup = img_popup.resize((w, h), Image.Resampling.LANCZOS)
img_map = img_map.resize((w, h), Image.Resampling.LANCZOS)
img_map_updated = img_map_updated.resize((w, h), Image.Resampling.LANCZOS)

pad = 20
banner_h = 75
canvas_w = w * 2 + pad * 3
canvas_h = h * 2 + pad * 3 + banner_h

canvas = Image.new('RGB', (canvas_w, canvas_h), (15, 23, 42))
draw = ImageDraw.Draw(canvas)

try:
    font_title = ImageFont.truetype('arialbd.ttf', 26)
    font_sub = ImageFont.truetype('arial.ttf', 15)
    font_label = ImageFont.truetype('arialbd.ttf', 16)
except Exception:
    font_title = font_sub = font_label = ImageFont.load_default()

draw.text((pad, 14), 'ALUR BARU: POPUP MISI SELESAI + BINTANG 1-3 & PETA KASUS (MAP LOBBY)', fill=(245, 158, 11), font=font_title)
draw.text((pad, 46), 'Stat-Casecode: Alur ending tanpa halaman results panjang -> Popup Misi Selesai -> Langsung ke Peta Level dengan Bintang Terupdate', fill=(148, 163, 184), font=font_sub)

coords = [
    (pad, banner_h + pad),
    (pad * 2 + w, banner_h + pad),
    (pad, banner_h + pad * 2 + h),
    (pad * 2 + w, banner_h + pad * 2 + h)
]

images = [img_chat, img_popup, img_map, img_map_updated]
labels = [
    '1. Pak Sutrisno Berterima Kasih di Ruang Guru (Step 3)',
    '2. Popup [Misi Selesai] (Bintang 1-3, Durasi, Akurasi, dan Tombol Selesai)',
    '3. Peta Pemilihan Level / Lobby (Bintang 3/3 Tampil di Kartu Level 1)',
    '4. Sistem Replay Dinamis (Bintang Otomatis Update Berdasarkan Run Terakhir: 2/3)'
]

for (x, y), img, label in zip(coords, images, labels):
    canvas.paste(img, (x, y))
    draw.rectangle([x, y, x + w, y + 32], fill=(15, 23, 42))
    draw.text((x + 12, y + 6), label, fill=(255, 255, 255), font=font_label)
    draw.rectangle([x, y, x + w, y + h], outline=(140, 98, 57), width=2)

out_path = os.path.join(art_dir, 'showcase_popup_misi_selesai_dan_map.png')
canvas.save(out_path, quality=95)
print('Saved collage successfully to:', out_path)
