import { Vec2 } from '@tiles/engine';
import { DisplayObject, Rectangle, Texture } from 'pixi.js'

/** Crops a texture. */
export function cropTexture(source: Texture, pos: Vec2, size: Vec2): PIXI.Texture {
  return new Texture(source.baseTexture, new Rectangle(pos[0], pos[1], size[0], size[1]));
}

/**
 * Converts `r` (red), `g` (green) and `b` (blue) to a hex number. All rgb values are
 * assumed to be normalized between `0` and `1`
 */
export function rgb2hex(r: number, g: number, b: number): number {
  return ((r * 255) << 16) + ((g * 255) << 8) + (b * 255 | 0);
}

/** Directions in which a renderable object can be flipped. */
export enum FlipDirection {
  None,
  Both,
  Horizontal,
  Vertical
}

/** Flips a `renderable` in the given `direction`. */
export function flip(renderable: DisplayObject, direction: FlipDirection): void {
  switch (direction) {
    case FlipDirection.None:
      renderable.scale.x = 1;
      renderable.scale.y = 1;
      break;
    case FlipDirection.Both:
      renderable.scale.x = -1;
      renderable.scale.y = -1;
      break;
    case FlipDirection.Horizontal:
      renderable.scale.x = -1;
      renderable.scale.y = 1;
      break;
    case FlipDirection.Vertical:
      renderable.scale.y = -1;
      renderable.scale.y = 1;
      break;
  }
}
