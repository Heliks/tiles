import { Vec2 } from '@tiles/engine';
import { Rectangle, Texture } from 'pixi.js'

/** Crops a texture. */
export function cropTexture(source: Texture, pos: Vec2, size: Vec2): PIXI.Texture {
  return new Texture(source.baseTexture, new Rectangle(pos[0], pos[1], size[0], size[1]));
}
