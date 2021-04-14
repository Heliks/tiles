import { hasFlag, parseGID, TmxGIDFlag } from './gid';
import { Shape } from './shape';
import { Rectangle } from '@heliks/tiles-math';
import { HasTmxPropertyData, tmxExtractProperties } from './properties';

export interface TmxObjectData extends HasTmxPropertyData {
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

export class GameObject extends Shape<unknown, Rectangle> {

  /** If `true` the object will be flipped on the x axis. */
  public flipX = false;

  /** If `true` the object will be flipped on the y axis. */
  public flipY = false;

  constructor(
    id: number,
    public readonly tileId: number,
    data: Rectangle,
    type: string,
    properties: unknown
  ) {
    super(id, data, type, properties);
  }

}

/** Creates a `Tile` from object `data`. */
export function tmxParseObject(data: TmxObjectData): GameObject {
  const rect = new Rectangle(
    data.width,
    data.height,
    data.x,
    data.y
  );

  const object = new GameObject(
    data.id,
    parseGID(data.gid),
    rect,
    data.type,
    tmxExtractProperties(data)
  );

  object.flipX = hasFlag(data.gid, TmxGIDFlag.FlipX);
  object.flipY = hasFlag(data.gid, TmxGIDFlag.FlipY);

  return object;
}







