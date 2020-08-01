import { TmxLayer, TmxLayerType, TmxTilemap } from './tmx-json';
import { Layer, LayerGroup, ObjectLayer, TileLayer } from '../layers';
import { AssetLoader, Format, getDirectory, LoadType } from '@tiles/assets';
import { Tilemap, TilesetItem } from '../tilemap';
import { parseProperties } from './utils';
import { TmxTilesetFormat } from './tmx-tileset-format';

/** @internal */
function parseLayer(data: TmxLayer): Layer<Tilemap> {
  const properties = parseProperties(data.properties ?? []);

  switch (data.type) {
    case TmxLayerType.Tiles:
      return new TileLayer(data.data, properties);
    case TmxLayerType.Objects:
      // Convert the TmxObjects to WorldObjects
      const objects = data.objects.map(item => {
        let x = item.x;
        let y = item.y;

        if (item.gid) {
          // Objects are anchored on their bottom-left corner. Normalize by converting
          // it to center.
          x += item.width / 2;
          y -= item.height / 2;
        }
        else {
          // Free drawn shapes are anchored on their top-left corner. Normalize by
          // converting it to center.
          x += item.width / 2;
          y += item.height / 2;
        }

        return {
          tileId: item.gid,
          ...item,
          x,
          y
        };
      });

      return new ObjectLayer(objects, properties);
    case TmxLayerType.Group:
      // Todo: any cast
      return new LayerGroup(data.layers.map(parseLayer), properties);
    default:
      throw new Error('Unknown layer type');
  }
}

/** @internal */
async function getExternalTileset(path: string, firstId: number, loader: AssetLoader): Promise<TilesetItem> {
  return new TilesetItem(
    await loader.fetch(path, new TmxTilesetFormat()),
    firstId
  );
}

/** Asset loader format for loading TMX tilemaps. */
export class TmxTilemapFormat implements Format<TmxTilemap, Tilemap> {

  /** @inheritDoc */
  public readonly name = 'tmx-tilemap';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** Creates a `Tilemap` from `data`. */
  public async process(data: TmxTilemap, file: string, loader: AssetLoader): Promise<Tilemap> {
    // Check if we've got the right TMX format.
    if (data.type !== 'map') {
      throw new Error('Data is not a TMX tilemap.');
    }

    // Infinite maps are not supported as of now.
    // Todo: Implement infinite maps
    if (data.infinite) {
      throw new Error('Infinite maps are not supported.');
    }

    // All paths in this file will be relative to the directory where the map file
    // is located.
    const basePath = getDirectory(file);

    // Load all tilesets on the tile map.
    const tilesets = await Promise.all(data.tilesets.map(
      item => getExternalTileset(`${basePath}/${item.source}`, item.firstgid, loader)
    ));

    const layers = data.layers.map(parseLayer);

    return new Tilemap(
      data.width,
      data.height,
      data.tilewidth,
      data.tileheight,
      layers,
      tilesets
    );
  }

}
