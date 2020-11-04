import { hasFlag, parseGID, TmxGIDFlag } from "./gid";

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

  /** If `true` the object will be flipped on the x axis. */
  public flipX = false;

  /** If `true` the object will be flipped on the y axis. */
  public flipY = false;

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
  const tile = new Tile(data.id, parseGID(data.gid));

  tile.x = data.x + (data.width / 2);
  tile.y = data.y - (data.height / 2);

  tile.flipX = hasFlag(data.gid, TmxGIDFlag.FlipX);
  tile.flipY = hasFlag(data.gid, TmxGIDFlag.FlipY);

  return tile;
}







