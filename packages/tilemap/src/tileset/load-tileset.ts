import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid, Type } from '@heliks/tiles-engine';
import { Tileset } from './tileset';
import { LoadTexture, SpriteGrid } from '@heliks/tiles-pixi';
import { Terrain, TerrainBit, TerrainId } from './terrain';


/**
 * Serialize-able terrain rule data. Each property corresponds to a {@link TerrainBit}
 * in a {@link TerrainRule}. If a property is set to `true`, the corresponding bit must
 * be present on a {@link TerrainId} to match this rule. If it is set to `false`, the
 * terrain id is not allowed to contain this bit. If a property is omitted completely,
 * its bit is optional.
 *
 * From the example below a rule will be generated that matches when the northern side
 * of a tile is adjacent to another tile in the terrain and has no tile adjacent on
 * the southern side. All other sides and corners are optional.
 *
 * ```json
 * {
 *   "n": true,
 *   "s:" false
 * }
 * ```
 */
export interface TerrainRuleFlags {
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
 * Serialize-able data for a {@link TerrainRule}.
 *
 * @see Terrain
 * @see TerrainRuleFlags
 */
export interface TerrainTileData {
  index: number | number[];
  rules?: TerrainRuleFlags;
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
interface TerrainMasks {
  contains: TerrainId;
  excludes: TerrainId;
}

/** @internal */
function deserializeTerrainBit(bit: TerrainBit, masks: TerrainMasks, value?: boolean) {
  if (value !== undefined) {
    if (value) {
      masks.contains |= bit;
    }
    else {
      masks.excludes |= bit;
    }
  }
}

/** @internal */
function deserializeTerrainRule(data: TerrainRuleFlags): TerrainMasks {
  const masks = {
    contains: 0,
    excludes: 0
  };

  deserializeTerrainBit(TerrainBit.North, masks, data.n);
  deserializeTerrainBit(TerrainBit.NorthEast, masks, data.ne);
  deserializeTerrainBit(TerrainBit.NorthWest, masks, data.nw);

  deserializeTerrainBit(TerrainBit.South, masks, data.s);
  deserializeTerrainBit(TerrainBit.SouthEast, masks, data.se);
  deserializeTerrainBit(TerrainBit.SouthWest, masks, data.sw);

  deserializeTerrainBit(TerrainBit.East, masks, data.e);
  deserializeTerrainBit(TerrainBit.West, masks, data.w);

  return masks;
}

/** @internal */
function deserializeTerrainData(data: TerrainData): Terrain {
  const terrain = new Terrain(data.name);

  for (const tile of data.tiles) {
    if (tile.rules) {
      const masks = deserializeTerrainRule(tile.rules);

      terrain.rule(
        tile.index,
        masks.contains,
        masks.excludes
      );
    }
    else {
      // If there are no rules, this tile can appear anywhere.
      terrain.rule(tile.index, 0);
    }
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
