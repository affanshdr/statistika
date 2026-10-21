import cv2
import numpy as np

WORLD_VW = 1235
WORLD_VH = 650

def checkLabKomputerWalkable(x: float, y: float) -> bool:
    # Outer boundaries
    if x < 60 or x > 1150: return False
    if y > 630: return False
    
    # Doorway spawn area (bottom right) vs right wall
    if y < 510 and x > 1020:
        return False
        
    # 1. Left computer desks cluster (tables, PCs, chairs)
    if 60 <= x <= 530 and y <= 510:
        return False
        
    # 2. Right computer desks cluster (tables, PCs, chairs)
    if 715 <= x <= 1020 and y <= 510:
        return False
        
    # 3. Front wall / whiteboard in central aisle
    if y < 405:
        return False
        
    return True

# Visual overlay
img = cv2.imread('debug_lab_svg.png')
img = cv2.resize(img, (WORLD_VW, WORLD_VH))
overlay = img.copy()

for y in range(0, WORLD_VH, 4):
    for x in range(0, WORLD_VW, 4):
        if checkLabKomputerWalkable(x, y):
            cv2.circle(overlay, (x, y), 2, (0, 255, 0), -1) # Green = walkable
        else:
            if y > 300:
                cv2.circle(overlay, (x, y), 2, (0, 0, 255), -1) # Red = blocked
                
cv2.addWeighted(overlay, 0.45, img, 0.55, 0, img)
cv2.imwrite('collision_lab_exact.png', img)
print('Generated collision_lab_exact.png')
