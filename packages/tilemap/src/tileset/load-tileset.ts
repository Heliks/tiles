import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid, Type } from '@heliks/tiles-engine';
import { Tileset } from './tileset';
import { LoadTexture, SpriteGrid } from '@heliks/tiles-pixi';
import { Terrain, TerrainType } from './terrain';


/**
 * Serialize-able data structure for terrains.
 *
 * @see Terrains
 */
export interface TerrainData {

  /**
   * Contains the terrain mappings.
   *
   * The layout of the data looks like this:
   *
   * ```json
   *  [
   *    0, // terrain tile id
   *    9, // tileset tile index,
   *    1, // terrain tile id
   *    6, // tileset terrain index
   *    // ...
   *  ]
   * ```
   */
  data: number[];

  /** User defined name. Must be unique across all terrains on a tileset. */
  name: string;

  /** @see TerrainType */
  type: TerrainType;

}

/**
 * Serialize-able data structure for tilesets.
 *
 * @see Tileset
 */
export interface TilesetData {

  /** Path where the tileset image is located. Relative to the tileset file. */
  image: string;

  /** Width of the tileset spritesheet image in px. */
  imageWidth: number;

  /** Height of the tileset spritesheet image in px. */
  imageHeight: number;

  /** Contains terrain definitions, if any. */
  terrains?: TerrainData[];

  /** Width of each individual tile in px. */
  tileWidth: number;

  /** Height of each individual tile in px. */
  tileHeight: number;

}

/** @internal */
async function createTilesetSpriteGrid(data: TilesetData, file: string, loader: AssetLoader): Promise<SpriteGrid> {
  const texture = await loader.fetch(getDirectory(file, data.image), new LoadTexture());

  return new SpriteGrid(
    new Grid(
      Math.floor(data.imageWidth / data.tileWidth),
      Math.floor(data.imageHeight / data.tileHeight),
      data.tileWidth,
      data.tileHeight
    ),
    texture
  );
}

/** @internal */
function deserializeTerrainData(data: TerrainData): Terrain {
  const terrain = new Terrain(data.name);

  for (let i = 0; i < data.data.length;) {
    const terrainId = data.data[i++];
    const tileIndex = data.data[i++];

    terrain.set(terrainId, tileIndex);
  }

  return terrain;
}

/**
 * Asset loader format to load a tileset from file.
 *
 * @see Tileset
 * @see TilesetData
 */
export class LoadTileset implements Format<TilesetData, Tileset> {

  /** @inheritDoc */
  public readonly name = 'load-tileset';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @inheritDoc */
  public getAssetType(): Type<Tileset> {
    return Tileset;
  }

  /** @inheritDoc */
  public async process(data: TilesetData, file: string, loader: AssetLoader): Promise<Tileset> {
    const tileset = new Tileset(await createTilesetSpriteGrid(data, file, loader));

    if (data.terrains) {
      for (const terrain of data.terrains) {
        tileset.addTerrain(deserializeTerrainData(terrain));
      }
    }

    return tileset;
  }

}
