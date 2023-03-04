import { HasProperties, parseCustomProperties, TmxProperties } from './tmx-properties';
import { parseGeometryData, TmxGeometry } from './tmx-geometry';
import { TmxTileset } from './tmx-tileset';
import { TmxTileAnimationFrame, TmxTileData } from '../tmx';
import { SpriteAnimationFrames } from '@heliks/tiles-pixi';



/** A tile that can occur on a {@link TmxTileset tileset}.*/
export interface TmxTile<P extends TmxProperties = TmxProperties> extends HasProperties<P> {

  /** Contains {@link SpriteAnimationFrames} if the tile is animated. */
  readonly animation?: SpriteAnimationFrames;

  /** Index the tile occupies on the tileset. */
  readonly index: number;

  /**
   * Contains {@link TmxGeometry geometry} that is attached to this tile via the Tiled
   * collision editor.
   */
  readonly geometry?: TmxGeometry[];

}

/** @internal */
function parseTileAnimation(data: TmxTileAnimationFrame[]): SpriteAnimationFrames {
  const frames = [];

  // Todo: As of now, spritesheet animations can not have durations for individual
  //  frames. Therefore, we determine the longest frame and use it for all others.
  let frameDuration = 0;

  for (const frame of data) {
    // Note: This tile ID is actually a tile index.
    frames.push(frame.tileid);

    if (frame.duration > frameDuration) {
      frameDuration = frame.duration;
    }
  }

  return {
    frameDuration,
    frames
  };
}

/** Parses {@link TmxTileData}. */
export function parseTileData(tileset: TmxTileset, data: TmxTileData): TmxTile {
  let geometry;

  // Assign shapes if tile has any.
  if (data.objectgroup && data.objectgroup.objects.length > 0) {
    geometry = data.objectgroup.objects.map(item => parseGeometryData(item));
  }

  let animation;

  if (data.animation) {
    animation = parseTileAnimation(data.animation);
  }

  return {
    // Note: Tiled is inconsistent with what is an ID and what is an index... In this
    // case, this is actually an index.
    index: data.id,
    properties: parseCustomProperties(data),
    animation,
    geometry
  };
}

