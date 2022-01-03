import { Rectangle, Vec2 } from '@heliks/tiles-engine';
import { hasFlag, parseGID, TmxGIDFlag } from './gid';
import { getProperties, Properties } from './properties';
import { Shape } from './shape';
import { TmxObject } from './tmx';
import { getCustomType } from './utils';


export class GameObject<P extends Properties = Properties> extends Shape<P, Rectangle> {

  /** If `true` the object will be flipped on the x axis. */
  public flipX = false;

  /** If `true` the object will be flipped on the y axis. */
  public flipY = false;

  /**
   * Global ID of the tile that should be used as a sprite for this game object. This is
   * only present on game object has a sprite.
   */
  public tileId?: number;

  /**
   * @param id Unique Id.
   * @param data Shape data.
   * @param properties User defined properties. If this object is based on a tile the
   *  tile itself can carry additional properties that are not included here unless
   *  they were changed for this specific object. They can instead be accessed via the
   *  appropriate tileset.
   * @param type (optional) User defined type.
   */
  constructor(id: number, data: Rectangle, properties: P, type?: string) {
    super(id, data, properties, type);
  }

}

/** A `GameObject` that is based on a tile. */
export interface Tile<P extends Properties = Properties> extends GameObject<P> {
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
    getProperties(data),
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
export function isTile<P extends Properties>(value: GameObject<P>): value is Tile<P> {
  return !! value.tileId;
}







