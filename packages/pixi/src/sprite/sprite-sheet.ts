import { Handle } from '@tiles/assets';
import { Grid, Vec2 } from '@tiles/engine';

export class SpriteSheet extends Grid {

  constructor(
    public readonly image: Handle,
    columns: number,
    rows: number,
    cellWidth: number,
    cellHeight: number
  ) {
    super(columns, rows, cellWidth, cellHeight);
  }

  public getSpriteSize(): Vec2 {
    return [
      this.cellWidth,
      this.cellHeight
    ]
  }

}
