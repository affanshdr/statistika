import cv2
import numpy as np

WORLD_VW = 1235
WORLD_VH = 650

def checkLabKomputerWalkable(x: float, y: float) -> bool:
    # Outer boundaries
    if x < 60: return False
    if y > 630: return False
    
    # Doorway spawn area (bottom right)
    if y >= 510:
        if x > 980: return False
    else:
        if x > 870: return False
        
    # Desks and obstacles
    # 1. Left computer desks cluster (tables, PCs, chairs)
    if 60 <= x <= 445 and y <= 510:
        return False
        
    # 2. Right computer desks cluster (tables, PCs, chairs)
    if 545 <= x <= 880 and y <= 510:
        return False
        
    # 3. Front wall / whiteboard in central aisle
    if y < 405:
        return False
        
    return True

def checkPerpustakaanWalkable(x: float, y: float) -> bool:
    # Outer boundaries
    if x < 50: return False
    if y > 630: return False
    
    # Doorway spawn area (bottom right)
    if y >= 515:
        if x > 980: return False
    else:
        if x > 870: return False
        
    # 1. Left reading table with wooden chairs (x: 145 - 505)
    if 145 <= x <= 505 and y <= 510:
        return False
        
    # 2. Left window wall base / radiator
    if x < 145 and y <= 470:
        return False
        
    # 3. Librarian desk counter with PC (x: 600 - 745)
    if 600 <= x <= 745 and y <= 510:
        return False
        
    # 4. Right tall bookshelves (x: 745 - 870)
    if 745 <= x <= 870 and y <= 520:
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
    
    for y in range(0, WORLD_VH, 4):
        for x in range(0, WORLD_VW, 4):
            if is_walkable_fn(x, y):
                cv2.circle(overlay, (x, y), 2, (0, 255, 0), -1) # Green = walkable
            else:
                if y > 250:
                    cv2.circle(overlay, (x, y), 2, (0, 0, 255), -1) # Red = blocked
                    
    cv2.addWeighted(overlay, 0.45, img, 0.55, 0, img)
    cv2.imwrite(out_path, img)

render_collision_overlay('debug_lab_svg.png', checkLabKomputerWalkable, 'collision_lab_perfect.png')
render_collision_overlay('debug_perpus_svg.png', checkPerpustakaanWalkable, 'collision_perpus_perfect.png')
print('Generated collision_lab_perfect.png and collision_perpus_perfect.png')
