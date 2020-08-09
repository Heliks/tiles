import { TmxTilemap } from './tmx-json';
import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Tilemap, TilesetItem } from '@heliks/tiles-tilemap';
import { TmxTilesetFormat } from './tmx-tileset-format';
import { Grid } from '@heliks/tiles-engine';
import { tmxParseLayers } from './layers';

/** @internal */
async function getExternalTileset(loader: AssetLoader, firstId: number, path: string): Promise<TilesetItem> {
  return new TilesetItem(
    await loader.fetch(path, new TmxTilesetFormat()),
    firstId
  );
}

/** @internal */
function verify(data: TmxTilemap): void {
  // Check if we've got the right TMX format.
  if (data.type !== 'map') {
    throw new Error('Data is not a TMX tilemap.');
  }

  // Infinite maps are not supported as of now.
  // Todo: Implement infinite maps
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

  /** Creates a `Tilemap` from `data`. */
  public async process(data: TmxTilemap, file: string, loader: AssetLoader): Promise<Tilemap> {
    // Make sure that the map data we've got is not corrupted.
    verify(data);

    // All paths in this file will be relative to the directory where the map file
    // is located.
    const basePath = getDirectory(file);

    // Load all tilesets on the tile map.
    const tilesets = await Promise.all(data.tilesets.map(
      item => getExternalTileset(loader, item.firstgid, `${basePath}/${item.source}`)
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
      tmxParseLayers(grid, data.layers)
    );
  }

}
