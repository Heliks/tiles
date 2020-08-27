import { TmxExternalTileset, TmxLayerType, TmxTilemap, TmxTileset } from './tmx-json';
import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Tilemap, Tileset } from '@heliks/tiles-tilemap';
import { TmxTilesetFormat } from './tmx-tileset-format';
import { Grid } from '@heliks/tiles-engine';
import { tmxParseLayer } from './layers';

/** @internal */
function isExternalTileset(data: TmxTileset): data is TmxExternalTileset {
  return data.source !== undefined;
}

/** @internal */
async function processTileset(loader: AssetLoader, basePath: string, data: TmxTileset): Promise<Tileset> {
  const format = new TmxTilesetFormat(data.firstgid);

  // If the given data is an external tileset we load it using the loader. Otherwise
  // we can simply parse it directly.
  return isExternalTileset(data)
    ? loader.fetch(`${basePath}/${data.source}`, format)
    : format.process(data, '', loader);
}

/** @internal */
function verify(data: TmxTilemap): void {
  // Check if we've got the right TMX format.
  if (data.type !== 'map') {
    throw new Error('Data is not a TMX tilemap.');
  }

  // Infinite maps are not supported as of now.
  if (data.infinite) {
    throw new Error('Infinite maps are not supported.');
  }
}

/** Asset loader format for loading TMX tilemaps. */
export class TmxTilemapFormat implements Format<TmxTilemap, Tilemap> {

  /** @inheritDoc */
  public readonly name = 'tmx-tilemap';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /**
   * Creates a `Tilemap` from `data`.
   *
   * Todo: Infinite maps
   */
  public async process(data: TmxTilemap, file: string, loader: AssetLoader): Promise<Tilemap> {
    // Make sure that the map data we've got is not corrupted.
    verify(data);

    // Load all tilesets on the tile map.
    const tilesets = await Promise.all(data.tilesets.map(
      item => processTileset(loader, getDirectory(file), item)
    ));

    const grid = new Grid(
      data.width,
      data.height,
      data.tilewidth,
      data.tileheight
    );

    return new Tilemap(
      grid,
      tilesets,
      data.layers.map(item => tmxParseLayer(item))
    );
  }

}
