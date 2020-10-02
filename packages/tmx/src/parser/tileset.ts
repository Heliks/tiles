import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { SpriteGrid, TextureFormat } from '@heliks/tiles-pixi';
import { Tileset as BaseTileset } from '@heliks/tiles-tilemap';
import { Grid } from '@heliks/tiles-engine';
import { HasTmxPropertyData, tmxParseProperties } from './properties';

interface TileData extends HasTmxPropertyData {
  animation?: {
    duration: number;
    tileid: number;
  }[];
  id: number;
}

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#tileset */
export interface TmxTilesetData extends HasTmxPropertyData {
  backgroundcolor: string;
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  name: string;
  margin: number;
  spacing: number;
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
  tiles?: TileData[];
  type: 'tileset';
}

/**
 * The unique ID of a tile. This is identical to the index on the tileset on which the
 * tile is contained.
 */
export type TileId = number;

/** Properties that can be attached to a tile. */
export interface TileProperties {
  /**
   * Name of the animation that should be placed on this time. The animation will be
   * started automatically when the tile is spawned into the world.
   */
  animation?: string;
}

/** Wrapper around the default tileset for tiled specific features. */
export class Tileset extends BaseTileset {

  /** Custom tile properties mapped to the ID of the tile to which they belong */
  public readonly properties = new Map<TileId, TileProperties>();

}

/** Asset loader format for TMX tilesets. */
export class TmxTilesetFormat implements Format<TmxTilesetData, Tileset> {

  /** @inheritDoc */
  public readonly name = 'tmx-tileset';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  constructor(public readonly firstId = 1) {}

  /** Creates a `Tileset` from `data`. */
  public async process(data: TmxTilesetData, file: string, loader: AssetLoader): Promise<Tileset> {
    // Amount of rows is not contained in the tiled format so it needs to be calculated
    // manually. The number is rounded down to cut of partial tiles.
    const grid = new Grid(
      data.columns,
      Math.floor(data.imageheight / data.tileheight),
      data.tilewidth,
      data.tileheight
    );

    // Convert the relative path in the tiled format.
    const source = `${getDirectory(file)}/${data.image}`;

    // Load the texture and create a SpriteGrid from it.
    const texture = await loader.fetch(source, new TextureFormat());
    const spritesheet = new SpriteGrid(grid, texture);
    const tileset = new Tileset(spritesheet, this.firstId);

    if (data.tiles) {
      for (const tileData of data.tiles) {
        // Handle animations.
        if (tileData.animation && tileData.animation.length > 0) {
          // Individual durations for frames are not supported by the SpriteRenderer so we
          // grab the duration from the first frame and re-use it for all other frames.
          const frameDuration = tileData.animation[0].duration;
          const frames = tileData.animation.map(item => item.tileid);

          // Use the ID of the tile as name for the animation.
          spritesheet.setAnimation(tileData.id.toString(), {
            frameDuration,
            frames
          });
        }

        // Parse properties.
        if (tileData.properties) {
          tileset.properties.set(tileData.id, tmxParseProperties(tileData));
        }
      }
    }

    return tileset;
  }

}



