import { hasFlag, parseGID, TmxGIDFlag } from '../gid';
import { Shape } from '../shape';
import { Rectangle } from '@heliks/tiles-math';
import { Properties, tmxExtractProperties } from '../properties';
import { getCustomType } from '../utils';
import { TmxObject } from './tmx';

export class GameObject<P = Properties> extends Shape<P, Rectangle> {

  /** If `true` the object will be flipped on the x axis. */
  public flipX = false;

  /** If `true` the object will be flipped on the y axis. */
  public flipY = false;

  /** Global ID of the tile on which this object is based on. */
  public tileId?: number;

  /**
   * @param id Id of the game object. This is unique for the map on which the object
   *  is located on.
   * @param data Shape data.
   * @param properties User defined properties. If this object is based on a tile the
   *  tile itself can carry additional properties that are not included here unless
   *  they were changed for this specific object. They can instead be accessed via the
   *  appropriate tileset.
   * @param type (optional) User defined type.
   */
  constructor(
    id: number,
    data: Rectangle,
    properties: P,
    type?: string
  ) {
    super(id, data, properties, type);
  }

}

/** A `GameObject` that is based on a tile. */
export interface Tile<P = Properties> extends GameObject<P> {
  /** @inheritDoc */
  tileId: number;
}

/** Creates a `Tile` from object `data`. */
export function tmxParseObject(data: TmxObject): GameObject {
  const rect = new Rectangle(
    data.width,
    data.height,
    data.x,
    data.y
  );

  const object = new GameObject(
    data.id,
    rect,
    tmxExtractProperties(data),
    getCustomType(data)
  );

  if (data.gid) {
    object.tileId = parseGID(data.gid);

    object.flipX = hasFlag(data.gid, TmxGIDFlag.FlipX);
    object.flipY = hasFlag(data.gid, TmxGIDFlag.FlipY);
  }

  return object;
}

/** Returns `true` if `value` is a `Tile<P>`. */
export function isTile<P>(value: GameObject<P>): value is Tile<P> {
  return !! value.tileId;
}







