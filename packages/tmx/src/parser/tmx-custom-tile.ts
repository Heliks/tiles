import { SpriteAnimationFrames } from '@heliks/tiles-pixi';
import { CustomTile, TmxTileset } from '../level/tmx-tileset';
import { TmxTileAnimationFrame, TmxTileData } from '../tmx';
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

/** Parses {@link TmxTileData}. */
export function parseTileData(tileset: TmxTileset, data: TmxTileData): CustomTile {
  const tile = new CustomTile<{}>(data.id, getCustomProps(data));

  // Parse animation, if any.
  if (data.animation) {
    tile.animation = parseTileAnimation(data.animation);
  }

  // Parse shapes, if any.
  if (data.objectgroup) {
    // tile.shapes = data.objectgroup.objects.map(item => parseGeometry(item));
  }

  return tile;
}

