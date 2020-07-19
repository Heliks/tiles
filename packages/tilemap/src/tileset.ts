import { SpriteSheet } from '@tiles/pixi';
import { Texture } from 'pixi.js';

export class Tileset extends SpriteSheet {

  constructor(
    public readonly name: string,
    texture: Texture,
    cols: number,
    rows: number,
    sw: number,
    sh: number
  ) {
    super(texture, cols, rows, sw, sh);
  }

}


