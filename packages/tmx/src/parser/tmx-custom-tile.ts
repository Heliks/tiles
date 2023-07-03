import { SpriteAnimationFrames } from '@heliks/tiles-pixi';
import { CustomTile } from '@heliks/tiles-tilemap';
import { TmxTileAnimationFrame, TmxTileData } from '../tmx';
import { parseGeometryData, TmxGeometry } from './tmx-geometry';
import { parseCustomProperties } from './tmx-properties';
import { TmxTileset } from './tmx-tileset';


/** @inheritDoc */
export class TmxCustomTile<P = unknown> extends CustomTile<P> {

  /**
   * If this tile is animated, contains the {@link SpriteAnimationFrames} required to
   * build the animation.
   */
  public animation?: SpriteAnimationFrames;

  /**
   * Contains {@link TmxGeometry geometry} that is extracted from custom shapes added to
   * the tile via the tiled collision editor.
   */
  public shapes?: TmxGeometry[];

  /**
   * @param width Unscaled tile width in px. Inherited from the parent tileset.
   * @param height Unscaled tile height in px. Inherited from the parent tileset.
   * @param pivot Unscaled tile h
   * @param index Index that the tile occupies on the tileset.
   * @param props Custom properties.
   */
  // constructor(public readonly width: number, public readonly height: number, public readonly pivot: Pivot, index: number, props: P) {}

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
export function parseTileData(tileset: TmxTileset, data: TmxTileData): TmxCustomTile {
  const tile = new TmxCustomTile(data.id, parseCustomProperties(data));

  // Parse animation, if any.
  if (data.animation) {
    tile.animation = parseTileAnimation(data.animation);
  }

  // Parse shapes, if any.
  if (data.objectgroup) {
    tile.shapes = data.objectgroup.objects.map(item => parseGeometryData(item));
  }

  return tile;
}

