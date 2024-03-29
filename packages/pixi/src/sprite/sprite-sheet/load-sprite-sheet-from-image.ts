import { Format, LoadType } from '@heliks/tiles-assets';
import { SpriteSheet } from './sprite-sheet';
import { SpriteGrid } from './sprite-grid';
import { Grid } from '@heliks/tiles-engine';
import { LoadTexture } from '../../load-texture';


/**
 * Asset loader format that loads an image and creates a `SpriteSheet` from it.
 *
 * @see LoadTexture
 * @see SpriteSheet
 */
export class LoadSpriteSheetFromImage implements Format<Blob, SpriteSheet> {

  /** @inheritDoc */
  public readonly name = 'PIXI:sprite-sheet-from-texture';

  /** @inheritDoc */
  public readonly type = LoadType.Blob;

  constructor(
    public readonly cols: number,
    public readonly rows: number,
    public readonly spriteWidth: number,
    public readonly spriteHeight: number
  ) {}

  /** @inheritDoc */
  public getAssetType(): typeof SpriteSheet {
    return SpriteSheet;
  }

  /** @inheritDoc */
  public process(data: Blob): SpriteSheet {
    return new SpriteGrid(
      new Grid(
        this.cols,
        this.rows,
        this.spriteWidth,
        this.spriteHeight
      ),
      new LoadTexture().process(data)
    );
  }

}
