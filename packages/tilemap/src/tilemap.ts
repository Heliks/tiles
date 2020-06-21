import { Tileset, TmxTilesetFormat } from "./tileset";
import { Grid } from "@tiles/engine";
import { TmxLayer, TmxTilemap } from "./tmx-json";
import { AssetLoader, Format, getDirectory, LoadType } from "@tiles/assets";
import { Layer, TileLayer } from "./layer";

export class TilesetItem {

  /**
   * Contains the last ID in the global ID range that the [[tileset]] of this item
   * is occupying.
   */
  public get lastId(): number {
    return this.firstId + this.tileset.size - 1;
  }

  /**
   * @param tileset A tileset.
   * @param firstId The start of the global ID range that the local ids of [[tileset]]
   *  are occupying.
   */
  constructor(
    public readonly tileset: Tileset,
    public readonly firstId: number
  ) {}

  /**
   * Converts `id` to its local counterpart on [[tileset]]. For example if [[firstId]]
   * is `12` this function will return the local ID `3` when given a global ID of `15`.
   */
  public toLocal(id: number): number {
    return id - this.firstId + 1;
  }

}

export class Tilemap extends Grid {

  constructor(
    cols: number,
    rows: number,
    tileWidth: number,
    tileHeight: number,
    public readonly layers: Layer[] = [],
    public readonly tilesets: TilesetItem[] = []
  ) {
    super(cols, rows, tileWidth, tileHeight)
  }

  /**
   * Returns the `TilesetItem` that has a `firstId` greater or equal, and a lastId
   * smaller or equal to the given tile `id`. Throws an error if none could be found.
   */
  public tileset(id: number): TilesetItem {
    const item = this.tilesets.find(item => item.firstId <= id && item.lastId >= id);

    if (!item) {
      throw new Error(`"${id}" does not match any tilesets.`);
    }

    return item;
  }

  /** Converts a global `id` to a local one. */
  public toLocalId(id: number): number {
    return this.tileset(id).toLocal(id);
  }

}



/** Asset loader format for loading TMX tilemaps. */
export class TmxTilemapFormat implements Format<TmxTilemap, Tilemap> {

  /** {@inheritDoc} */
  public readonly name = 'tmx-tilemap';

  /** {@inheritDoc} */
  public readonly type = LoadType.Json;

  protected async getExternalTileset(
    path: string,
    firstId: number,
    loader: AssetLoader
  ): Promise<TilesetItem> {
    return new TilesetItem(
      await loader.fetch(path, new TmxTilesetFormat()),
      firstId
    );
  }

  public parseLayer(data: TmxLayer): Layer {
    switch (data.type) {
      case "tilelayer":
        return new TileLayer(data.data);
        break;
      default:
        throw new Error(`Unknown error type "${data.type}"`);
    }
  }

  /** @inheritDoc */
  public async process(
    data: TmxTilemap,
    file: string,
    loader: AssetLoader
  ): Promise<Tilemap> {
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
      item => this.getExternalTileset(
        `${basePath}/${item.source}`,
        item.firstgid,
        loader
      )
    ));

    const layers = data.layers.map(this.parseLayer.bind(this));

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
