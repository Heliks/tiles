import { SpriteGrid } from '@tiles/pixi';
import { Texture } from 'pixi.js';
import { Grid } from '@tiles/engine';

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


