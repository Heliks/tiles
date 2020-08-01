import { Format, LoadType } from '@tiles/assets';
import { TextureFormat } from '../utils';
import { SpriteGrid, SpriteSheet } from '../sprite-sheet';
import { Grid } from '@tiles/engine';

/** (WIP) */
export class SpriteSheetFromTexture implements Format<Blob, SpriteSheet> {

  /** {@inheritDoc} */
  public readonly name = 'PIXI:sprite-sheet';

  /** {@inheritDoc} */
  public readonly type = LoadType.Blob;

  constructor(
    public readonly cols: number,
    public readonly rows: number,
    public readonly spriteWidth: number,
    public readonly spriteHeight: number
  ) {}

  /** {@inheritDoc} */
  public process(data: Blob): SpriteSheet {
    return new SpriteGrid(
      new Grid(this.cols, this.rows, this.spriteWidth, this.spriteHeight),
      new TextureFormat().process(data)
    );
  }

}
