import cv2
import numpy as np

WORLD_VW = 1235
WORLD_VH = 650

def checkPerpustakaanWalkable(x: float, y: float) -> bool:
    # Outer boundaries
    if x < 60 or x > 1150: return False
    if y > 630: return False
    
    # Entrance door area vs right wall
    if y < 510 and x > 1070:
        return False
        
    # 1. Left reading table with wooden chairs
    if 200 <= x <= 620 and y <= 490:
        return False
        
    # 2. Left window wall base / radiator
    if x < 200 and y <= 480:
        return False
        
    # 3. Librarian desk counter with PC
    if 750 <= x <= 915 and y <= 490:
        return False
        
    # 4. Right tall bookshelves
    if 915 <= x <= 1070 and y <= 500:
        return False
        
    # 5. Back wall / shelf in central aisle
    if y < 415:
        return False
        
    return True

# Visual overlay
img = cv2.imread('debug_perpus_svg.png')
img = cv2.resize(img, (WORLD_VW, WORLD_VH))
overlay = img.copy()

for y in range(0, WORLD_VH, 4):
    for x in range(0, WORLD_VW, 4):
        if checkPerpustakaanWalkable(x, y):
            cv2.circle(overlay, (x, y), 2, (0, 255, 0), -1) # Green = walkable
        else:
            if y > 300:
                cv2.circle(overlay, (x, y), 2, (0, 0, 255), -1) # Red = blocked
                
cv2.addWeighted(overlay, 0.45, img, 0.55, 0, img)
cv2.imwrite('collision_perpus_exact.png', img)
print('Generated collision_perpus_exact.png')
