import { Grid, Rectangle } from '@heliks/tiles-engine';
import {
  ChunkEntityLayer,
  ChunkLayer,
  ChunkLayerProps,
  ChunkLayerType,
  ChunkMetaLayers,
  ChunkTileLayer
} from '@heliks/tiles-level';
import { TmxInfiniteTileLayerData, TmxLayerTypeData, TmxMapData, TmxObjectLayerData, TmxTileLayerData } from '../tmx';
import { ParserConfig } from './config';
import { parseObjectData } from './objects';
import { getCustomProps } from './props';


/**
 * @param map Map data from which layers are parsed
 * @param grid Tile grid of a chunk
 * @param x Chunk coordinate along the x-axis
 * @param y Chunk coordinate along the y-axis
 * @param config Parser config
 */
export function parseLayers(map: TmxMapData, grid: Grid, x: number, y: number, config: ParserConfig): ChunkLayer[] {
  const layers = [];

  // Boundaries from where objects are extracted on object layers.
  const bounds = new Rectangle(
    grid.width,
    grid.height,
    grid.width * x,
    grid.height * y
  );

  for (const data of map.layers) {
    switch (data.type) {
      case TmxLayerTypeData.Tiles:
        const layer = createTileLayer(data, grid, x, y);

        // Important: Creating the tile layer can return undefined if the layer data did
        // not have any tiles for our particular chunk. In that case, skip it.
        if (layer) {
          layers.push(layer);
        }

        break;
      case TmxLayerTypeData.Objects:
        layers.push(createEntityLayer(data, bounds, config));

        break;
      default:
        console.warn(`Layer type not supported: ${data.type}`);
    }
  }

  return layers;
}

/**
 * Extracts meta-layers from an array of chunk layers.
 *
 * Each meta-layer is stored using its own `name`. Subsequently, every name must be
 * unique or this function will throw an error.
 *
 * @remarks
 * This modifies the original `layers` input by removing the extracted meta-layers.
 */
export function extractMetaLayers(layers: ChunkLayer[]): ChunkMetaLayers {
  const meta: ChunkMetaLayers = {};

  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];

    if (layer.props.$meta) {
      if (meta[layer.name]) {
        throw new Error(`Name for meta layers must be unique: ${layer.name}`);
      }

      meta[ layer.name ] = layer;

      // Remove from the map array.
      layers.splice(i, 1);
    }
  }

  return meta;
}

/**
 * Creates a {@link ChunkEntityLayer} from all objects on the given object `layer` that
 * fall within the specified `bounds`. Objects are parsed in the process.
 *
 * The boundary check is half-open. The left and top edges are inclusive, while the right
 * and bottom edges are exclusive. This prevents objects that are directly on the edge of
 * the boundary from being assigned to multiple layers.
 *
 * @param layer Layer data that should be parsed
 * @param bounds Boundaries in pixels that determine which objects will be included
 * @param config Parser config
 */
export function createEntityLayer(layer: TmxObjectLayerData, bounds: Rectangle, config: ParserConfig): ChunkEntityLayer {
  const objects = [];

  for (const item of layer.objects) {
    // Rectangle.contains() is inclusive so we need to do this boundary check manually.
    if (item.x >= bounds.x && item.y >= bounds.y && item.x < bounds.x + bounds.width && item.y < bounds.y + bounds.height) {
      objects.push(parseObjectData(item, config));
    }
  }

  const props = getCustomProps<ChunkLayerProps>(layer);

  return {
    type: ChunkLayerType.Entities,
    data: objects,
    name: layer.name,
    props
  };
}

/**
 * Creates a {@link ChunkTileLayer} for the chunk at the given location. This can
 * return `undefined` if the given `layer` data does not contain any tiles for that
 * particular chunk.
 *
 * @param layer TMX Layer data from which tiles will be extracted
 * @param grid Tile grid of a chunk
 * @param x Location of the chunk on the map grid along x-axis
 * @param y Location of the chunk on the map grid along y-axis
 */
export function createTileLayer(layer: TmxTileLayerData, grid: Grid, x: number, y: number): ChunkTileLayer | undefined {
  const data = isInfiniteLayer(layer) ? getTileChunkData(layer, grid, x, y) : layer.data;

  if (data) {
    const props = getCustomProps<ChunkLayerProps>(layer);

    return {
      type: ChunkLayerType.Tiles,
      name: layer.name,
      data,
      props
    };
  }
}

/** @internal */
function isInfiniteLayer(layer: TmxTileLayerData): layer is TmxInfiniteTileLayerData {
  return Boolean((layer as TmxInfiniteTileLayerData).chunks);
}

/** @internal */
function getTileChunkData(layer: TmxInfiniteTileLayerData, grid: Grid, x: number, y: number): number[] | undefined {
  // Find the equivalent chunk in the tile layer. Tiled stores the chunk position as
  // a pixel position rather than a grid location, so we need to convert it first.
  const chunk = layer.chunks.find(chunk => chunk.x / grid.cols === x && chunk.y / grid.rows === y);

  if (chunk) {
    return chunk.data;
  }
}


