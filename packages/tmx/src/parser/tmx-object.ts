import { PivotPreset, Rectangle } from '@heliks/tiles-engine';
import { ColliderShape } from '@heliks/tiles-physics';
import { TmxObjectData } from '../tmx';
import { parseCustomType } from './custom-type';
import { hasFlag, parseGID, TmxGIDFlag } from './gid';
import { parseGeometryData, TmxGeometry } from './tmx-geometry';
import { parseCustomProperties, TmxProperties } from './tmx-properties';


/**
 * A freely placed object created from a shape.
 *
 * - `P`: Custom Properties
 * - `C`: Geometric shape of the object.
 */
export type TmxGeometryObject<P extends TmxProperties = TmxProperties, S extends ColliderShape = ColliderShape> = TmxGeometry<P, S>;

/**
 * A freely placed object that uses a tile as its sprite.
 *
 * - `P`: Custom Properties
 * - `C`: Geometric shape of the object.
 */
export interface TmxTileObject<P extends TmxProperties = TmxProperties> extends TmxGeometry<P, Rectangle> {

  /** If set to `true`, the sprite of the object will be flipped along the x-axis. */
  flipX: boolean;

  /** If set to `true`, the sprite of the object will be flipped along the y-axis. */
  flipY: boolean;

  /** Global ID of the tile that this object is using as its sprite. */
  tileId: number;

}

/**
 * An object that is placed on an {@link ObjectLayer object layer}.
 *
 * - `P`: Custom Properties
 * - `C`: Geometric shape of the object.
 */
export type TmxObject<P extends TmxProperties = TmxProperties, S extends ColliderShape = ColliderShape> = TmxGeometryObject<P, S> | TmxTileObject<P>;

/**
 * Returns `true` if `value` is a {@link TmxTileObject}.
 *
 * @see TmxShapeObject
 * @see TmxTileObject
 */
export function isTile<P extends TmxProperties>(value: TmxObject<P>): value is TmxTileObject<P> {
  return !! (value as TmxTileObject).tileId;
}

/** Parses {@link TmxObjectData} and produces a {@link TmxObject}. */
export function parseObjectData(data: TmxObjectData): TmxObject {
  if (! data.gid) {
    return parseGeometryData(data, PivotPreset.CENTER);
  }

  // Objects that are not freely placed shapes are always rectangles.
  const shape = new Rectangle(data.width, data.height, data.x, data.y);

  let tileId;

  let flipX = false;
  let flipY = false;

  if (data.gid) {
    tileId = parseGID(data.gid);

    flipX = hasFlag(data.gid, TmxGIDFlag.FlipX);
    flipY = hasFlag(data.gid, TmxGIDFlag.FlipY);
  }

  return {
    id: data.id,
    properties: parseCustomProperties(data),
    type: parseCustomType(data),
    flipX,
    flipY,
    shape,
    tileId
  };
}







