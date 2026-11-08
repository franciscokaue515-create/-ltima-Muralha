'use strict';
function clampCam(c) {
  const hx = MAP.x1 + WALL - W / 2, lx = MAP.x0 - WALL + W / 2, hy = MAP.y1 + WALL - H / 2, ly = MAP.y0 - WALL + H / 2;
  c.x = lx <= hx ? clamp(c.x, lx, hx) : 0; c.y = ly <= hy ? clamp(c.y, ly, hy) : 0;
}
