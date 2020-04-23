import { Format, LoadType } from '@tiles/assets';
import { TextureFormat } from "../texture-format";
import { SpriteSheet } from "./sprite-sheet";

/** (WIP) */
export class SpriteSheetFromTexture implements Format<SpriteSheet, Blob> {

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
    return new SpriteSheet(
      new TextureFormat().process(data),
      this.cols,
      this.rows,
      this.spriteWidth,
      this.spriteHeight
    );
  }

}
