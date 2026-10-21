import cv2
import numpy as np

# Coordinates converter
# Image is 1376 x 768 -> SVG is 1235 x 650
SCALE_X = 1235.0 / 1376.0
SCALE_Y = 650.0 / 768.0

def img_to_svg(x, y, w, h):
    return (round(x * SCALE_X), round(y * SCALE_Y), round(w * SCALE_X), round(h * SCALE_Y))

# 1. Analyze Lab Komputer
im_lab = cv2.imread('public/Assets/Building/Lab Komputer/Lab.webp')
# Let's resize im_lab to SVG dimensions directly (1235 x 650) to analyze in SVG coordinate space!
im_lab_svg = cv2.resize(im_lab, (1235, 650))
cv2.imwrite('debug_lab_svg.png', im_lab_svg)

# 2. Analyze Perpustakaan
im_perpus = cv2.imread('public/Assets/Building/Perpustakaan/Perpustakaan.webp')
im_perpus_svg = cv2.resize(im_perpus, (1235, 650))
cv2.imwrite('debug_perpus_svg.png', im_perpus_svg)

print('Saved SVG-scaled debug images: debug_lab_svg.png and debug_perpus_svg.png')
