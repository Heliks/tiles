import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid, Type } from '@heliks/tiles-engine';
import { Tileset } from './tileset';
import { LoadTexture, SpriteGrid } from '@heliks/tiles-pixi';
import { Terrain, TerrainBit, TerrainId } from './terrain';


/**
 * Serialize-able terrain rule data from which a {@link TerrainId} can be generated. Each
 * property corresponds to a {@link TerrainBit}. For every property that is set, the
 * corresponding terrain bit will be added to the terrain id generated from it.
 */
export interface TerrainRuleData {
  n?: boolean;
  ne?: boolean;
  nw?: boolean;
  s?: boolean;
  se?: boolean;
  sw?: boolean;
  e?: boolean;
  w?: boolean;
}

/**
 * Serialize-able data that maps a tile index to {@link TerrainRuleData}. From this data
 * structure, a {@link TerrainRule} will be generated.
 */
export interface TerrainTileData {
  index: number;
  rules?: TerrainRuleData;
}

/**
 * Serialize-able data structure for a terrain.
 *
 * @see Terrains
 */
export interface TerrainData {
  name: string;
  tiles: TerrainTileData[];
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
function deserializeTerrainId(data: TerrainRuleData): TerrainId {
  let id = 0;

  if (data.n) id |= TerrainBit.North;
  if (data.ne) id |= TerrainBit.NorthEast;
  if (data.nw) id |= TerrainBit.NorthWest;

  if (data.s) id |= TerrainBit.South;
  if (data.se) id |= TerrainBit.SouthEast;
  if (data.sw) id |= TerrainBit.SouthWest;

  if (data.e) id |= TerrainBit.East;
  if (data.w) id |= TerrainBit.West;

  return id;
}

/** @internal */
function deserializeTerrainData(data: TerrainData): Terrain {
  const terrain = new Terrain(data.name);

  for (const tile of data.tiles) {
    const terrainId = tile.rules
      ? deserializeTerrainId(tile.rules)
      : 0;

    terrain.rule(tile.index, terrainId);
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
