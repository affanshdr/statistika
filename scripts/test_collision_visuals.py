import cv2
import numpy as np

WORLD_VW = 1235
WORLD_VH = 650

def checkLabKomputerWalkable(x: float, y: float) -> bool:
    # Outer boundaries
    if x < 70: return False
    if y > 635: return False
    
    # Doorway spawn area (bottom right)
    if y >= 515:
        if x > 980: return False
    else:
        if x > 870: return False
        
    # Desks and obstacles
    # 1. Left computer desks cluster (tables, PCs, chairs)
    if 70 <= x <= 440 and y <= 505:
        return False
        
    # 2. Right computer desks cluster (tables, PCs, chairs)
    if 560 <= x <= 880 and y <= 505:
        return False
        
    # 3. Front wall / whiteboard in central aisle
    if y < 400:
        return False
        
    return True

def checkPerpustakaanWalkable(x: float, y: float) -> bool:
    # Outer boundaries
    if x < 60: return False
    if y > 635: return False
    
    # Doorway spawn area (bottom right)
    if y >= 515:
        if x > 980: return False
    else:
        if x > 870: return False
        
    # 1. Left reading table with wooden chairs
    if 150 <= x <= 500 and y <= 505:
        return False
        
    # 2. Librarian desk counter with PC
    if 600 <= x <= 745 and y <= 505:
        return False
        
    # 3. Right tall bookshelf
    if 750 <= x <= 870 and y <= 515:
        return False
        
    # 4. Far left under window
    if x < 150 and y <= 450:
        return False
        
    # 5. Back wall / shelf in central aisle
    if y < 415:
        return False
        
    return True

# Render collision masks on debug images
def render_collision_overlay(bg_path, is_walkable_fn, out_path):
    img = cv2.imread(bg_path)
    img = cv2.resize(img, (WORLD_VW, WORLD_VH))
    overlay = img.copy()
    
    # Check grid of points every 5px
    for y in range(0, WORLD_VH, 4):
        for x in range(0, WORLD_VW, 4):
            if is_walkable_fn(x, y):
                cv2.circle(overlay, (x, y), 2, (0, 255, 0), -1) # Green = walkable
            else:
                if y > 300:
                    cv2.circle(overlay, (x, y), 2, (0, 0, 255), -1) # Red = blocked
                    
    # Blend
    cv2.addWeighted(overlay, 0.45, img, 0.55, 0, img)
    cv2.imwrite(out_path, img)

render_collision_overlay('debug_lab_svg.png', checkLabKomputerWalkable, 'collision_lab_visual.png')
render_collision_overlay('debug_perpus_svg.png', checkPerpustakaanWalkable, 'collision_perpus_visual.png')
print('Generated collision_lab_visual.png and collision_perpus_visual.png')
