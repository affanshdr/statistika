import cv2
import numpy as np

# Let's inspect the layout of Lab Komputer
im_lab = cv2.imread('debug_lab_svg.png')
# Dimensions: 1235 wide, 650 high

# Let's inspect horizontal slices of Lab Komputer from y=350 to y=650
# In Lab Komputer:
# Background has:
# - Front wall with whiteboard / projector screen: y < 390
# - What desks / computers are there?
# Let's save a grid overlay of both rooms to inspect visually with pixel grids!

def draw_grid(img, name):
    annotated = img.copy()
    # Draw horizontal grid lines every 50px
    for y in range(0, 650, 50):
        cv2.line(annotated, (0, y), (1235, y), (0, 255, 255), 1)
        cv2.putText(annotated, str(y), (10, y + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)
    # Draw vertical grid lines every 50px
    for x in range(0, 1235, 50):
        cv2.line(annotated, (x, 0), (x, 650), (255, 255, 0), 1)
        if x % 100 == 0:
            cv2.putText(annotated, str(x), (x + 2, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 0), 1)
    cv2.imwrite(name, annotated)

draw_grid(im_lab, 'grid_lab_svg.png')
im_perpus = cv2.imread('debug_perpus_svg.png')
draw_grid(im_perpus, 'grid_perpus_svg.png')
print('Generated grid_lab_svg.png and grid_perpus_svg.png')
