export interface TmxObjectData {
  gid: number;
  height: number;
  id: number;
  name: string;
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

export class Tile {

  /** Position on X axis in px. */
  public x = 0;

  /** Position on Y axis in px. */
  public y = 0;

  /**
   * @param id
   * @param tileId
   */
  constructor(
    public readonly id: number,
    public readonly tileId: number
  ) {}

}

/** Creates a `Tile` from object `data`. */
export function tmxParseObject(data: TmxObjectData): Tile {
  const tile = new Tile(data.id, data.gid);

  tile.x = data.x + (data.width / 2);
  tile.y = data.y - (data.height / 2);

  return tile;
}

/*
export function tmxConvertObjectToShape(data: TmxObject): Shape {
  const shape = new Shape();

  // Free drawn shapes are anchored on their top-left corner. Normalize by
  // converting it to center.
  tile.x = data.x + (data.width / 2);
  tile.y = data.x + (data.height / 2);

  return shape;
}
 */






