import { HasProperties, parseCustomProperties, TmxProperties } from './tmx-properties';
import { parseGeometryData, TmxGeometry } from './tmx-geometry';
import { TmxTileset } from './tmx-tileset';
import { TmxTileData } from '../tmx';


export interface TmxAnimationFrame {
  tileId: number;
  duration: number;
}

/** A tile that can occur on a {@link TmxTileset tileset}.*/
export interface TmxTile<P extends TmxProperties = TmxProperties> extends HasProperties<P> {

  /** Contains animations mapped to their animation name. */
  readonly animation?: TmxAnimationFrame[];

  /** Unique Tile ID. */
  readonly id: number;

  /**
   * Contains {@link TmxGeometry geometry} that is attached to this tile via the Tiled
   * collision editor.
   */
  readonly geometry?: TmxGeometry[];

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
    animation = data.animation.map(frame => {
      return {
        duration: frame.duration,
        tileId: frame.tileid
      };
    })
  }

  return {
    // Note: Tiled is inconsistent with what is an ID and what is an index... In this
    // case, this is actually an index. Convert it to make it consistent.
    id: data.id + 1,
    properties: parseCustomProperties(data),
    animation,
    geometry
  };
}

