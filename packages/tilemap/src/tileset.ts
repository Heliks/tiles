import { SpriteGrid } from '@heliks/tiles-pixi';
import { Texture } from 'pixi.js';
import { Grid } from '@heliks/tiles-engine';

export class Tileset extends SpriteGrid {

  constructor(
    public readonly name: string,
    texture: Texture,
    cols: number,
    rows: number,
    sw: number,
    sh: number
  ) {
    super(new Grid(cols, rows, sw, sh), texture);
  }

}


