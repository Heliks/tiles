import { CustomTile, Geometry, Tileset } from '@heliks/tiles-level';
import { SpriteAnimationFrames } from '@heliks/tiles-pixi';
import { TmxGeometryData, TmxTileAnimationFrame, TmxTileData } from '../tmx';
import { ParserConfig } from './config';
import { parseGeometry } from './geometry';
import { getCustomProps } from './props';


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

/**
 * Parses geometry that is found on a tile.
 *
 * Tile geometry is different from other geometry because its position is always
 * calculated from the top left corner of the tile. This function converts it to
 * be relative to the tile pivot instead.
 *
 * @param tileset Source tileset.
 * @param tw Width of the geometries source tile.
 * @param th Height of the geometries source tile.
 * @param config Parser config.
 * @param data Geometry data.
 *
 * @internal
 */
function parseTileGeometry(tileset: Tileset, tw: number, th: number, config: ParserConfig, data: TmxGeometryData[]): Geometry[] {
  const result = [];

  const ox = (tw * tileset.pivot.x) / config.unitSize;
  const oy = (th * tileset.pivot.y) / config.unitSize;

  for (const item of data) {
    const geometry = parseGeometry(item, config);

    geometry.shape.x -= ox;
    geometry.shape.y -= oy;

    result.push(geometry);
  }

  return result;
}

/** Parses {@link TmxTileData}. */
export function parseTileData(tileset: Tileset, tw: number, th: number, config: ParserConfig, data: TmxTileData): CustomTile {
  const tile: CustomTile = {
    index: data.id,
    props: getCustomProps(data)
  };

  if (data.animation) {
    tile.animation = parseTileAnimation(data.animation);
  }

  if (data.objectgroup) {
    tile.shapes = parseTileGeometry(tileset, tw, th, config, data.objectgroup.objects);
  }

  return tile;
}

