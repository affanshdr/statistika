import os
from PIL import Image, ImageDraw, ImageFont

art_dir = r'C:\Users\Asus_i7\.gemini\antigravity\brain\fa4932e4-58a9-4892-9eb7-cf6716c2899c'

img1 = Image.open(os.path.join(art_dir, 'quiz_flow_step2_pak_thanks.png')).convert('RGB')
img2 = Image.open(os.path.join(art_dir, 'quiz_flow_step3_question_bubble.png')).convert('RGB')
img3 = Image.open(os.path.join(art_dir, 'quiz_flow_step4_wrong_feedback.png')).convert('RGB')
img4 = Image.open(os.path.join(art_dir, 'quiz_flow_step5_mission_complete.png')).convert('RGB')

w, h = 800, 450
img1 = img1.resize((w, h), Image.Resampling.LANCZOS)
img2 = img2.resize((w, h), Image.Resampling.LANCZOS)
img3 = img3.resize((w, h), Image.Resampling.LANCZOS)
img4 = img4.resize((w, h), Image.Resampling.LANCZOS)

pad = 20
banner_h = 80
canvas_w = w * 2 + pad * 3
canvas_h = h * 2 + pad * 3 + banner_h

canvas = Image.new('RGB', (canvas_w, canvas_h), (20, 14, 10))
draw = ImageDraw.Draw(canvas)

try:
    font_title = ImageFont.truetype('arialbd.ttf', 24)
    font_sub = ImageFont.truetype('arial.ttf', 14)
    font_label = ImageFont.truetype('arialbd.ttf', 15)
except Exception:
    font_title = font_sub = font_label = ImageFont.load_default()

draw.text((pad, 14), 'KUIS AKHIR PAK SUTRISNO: EVALUASI KLAIM RATA-RATA & CLOUD CHAT KOMIK', fill=(245, 158, 11), font=font_title)
draw.text((pad, 46), 'Format speech bubble komik interaktif seperti Pak Satpam -> Pertanyaan klaim diacak realistis -> Misi Selesai Popup -> Map Kasus', fill=(220, 200, 175), font=font_sub)

coords = [
    (pad, banner_h + pad),
    (pad * 2 + w, banner_h + pad),
    (pad, banner_h + pad * 2 + h),
    (pad * 2 + w, banner_h + pad * 2 + h)
]

images = [img1, img2, img3, img4]
labels = [
    '1. Pak Sutrisno: Berterima Kasih & Mengajak Kuis Evaluasi [ Mulai Kuis Evaluasi 🎯 ]',
    '2. Cloud Chat Kuis: Pertanyaan Klaim Rata-Rata Diacak Realistis (Pilihan A, B, C, D)',
    '3. Feedback Interaktif Edukatif: Validasi Pintar Jika Pilihan Siswa Belum Tepat',
    '4. Misi Selesai: Popup Bintang 1-3 Terbuka Setelah Kuis Selesai Dijawab Benar'
]

for (x, y), img, label in zip(coords, images, labels):
    canvas.paste(img, (x, y))
    draw.rectangle([x, y, x + w, y + 32], fill=(30, 20, 15))
    draw.text((x + 12, y + 7), label, fill=(254, 243, 199), font=font_label)
    draw.rectangle([x, y, x + w, y + h], outline=(245, 158, 11), width=2)

out_path = os.path.join(art_dir, 'showcase_kuis_pak_sutrisno_cloud_chat.png')
canvas.save(out_path, quality=95)
print('Saved collage successfully to:', out_path)
