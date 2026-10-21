import os
from PIL import Image, ImageDraw, ImageFont

art_dir = r'C:\Users\Asus_i7\.gemini\antigravity\brain\fa4932e4-58a9-4892-9eb7-cf6716c2899c'

img1 = Image.open(os.path.join(art_dir, 'chitchat_step1_stevunt_data_ready.png')).convert('RGB')
img2 = Image.open(os.path.join(art_dir, 'chitchat_step2_pak_thanks.png')).convert('RGB')
img3 = Image.open(os.path.join(art_dir, 'popup_misi_selesai_updated.png')).convert('RGB')
img4 = Image.open(os.path.join(art_dir, 'lobby_map_final_verification.png')).convert('RGB')

w, h = 800, 450
img1 = img1.resize((w, h), Image.Resampling.LANCZOS)
img2 = img2.resize((w, h), Image.Resampling.LANCZOS)
img3 = img3.resize((w, h), Image.Resampling.LANCZOS)
img4 = img4.resize((w, h), Image.Resampling.LANCZOS)

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

draw.text((pad, 14), 'ALUR CHIT-CHAT AKHIR: PENYERAHAN DATA & TERIMA KASIH PAK SUTRISNO', fill=(245, 158, 11), font=font_title)
draw.text((pad, 46), 'Stevunt lapor data siap -> Pak Sutrisno berterima kasih -> Popup Misi Selesai (Bintang 1-3) -> Kembali ke Map', fill=(148, 163, 184), font=font_sub)

coords = [
    (pad, banner_h + pad),
    (pad * 2 + w, banner_h + pad),
    (pad, banner_h + pad * 2 + h),
    (pad * 2 + w, banner_h + pad * 2 + h)
]

images = [img1, img2, img3, img4]
labels = [
    '1. Stevunt: \"Ini Pak, saya sudah mencari median, modus, dan rata-ratanya...\"',
    '2. Pak Sutrisno: \"Wah, terima kasih banyak ya Stevunt sudah membantu Bapak!\"',
    '3. Popup \"Misi Selesai\" (Bintang 1-3, Durasi, Akurasi, dan Tombol Selesai)',
    '4. Peta Kasus (Lobby): Bintang Level 1 Tampil & Siap Main Ulang'
]

for (x, y), img, label in zip(coords, images, labels):
    canvas.paste(img, (x, y))
    draw.rectangle([x, y, x + w, y + 32], fill=(15, 23, 42))
    draw.text((x + 12, y + 6), label, fill=(255, 255, 255), font=font_label)
    draw.rectangle([x, y, x + w, y + h], outline=(140, 98, 57), width=2)

out_path = os.path.join(art_dir, 'showcase_chitchat_baru_dan_popup.png')
canvas.save(out_path, quality=95)
print('Saved collage successfully to:', out_path)
