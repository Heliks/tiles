import { Grid, Rectangle } from '@heliks/tiles-engine';
import {
  ChunkEntityLayer,
  ChunkLayer,
  ChunkLayerProps,
  ChunkLayerType,
  ChunkMetaLayers,
  ChunkTileLayer
} from '@heliks/tiles-level';
import { TmxInfiniteMap, TmxInfiniteTileLayerData, TmxLayerTypeData, TmxObjectLayerData } from '../../tmx';
import { ParserConfig } from '../config';
import { getCustomProps, HasProperties } from '../props';
import { parseObjectData, TmxObject } from '../tmx-object';
import { TileChunk } from './tile-chunk';


/** The kinds of layers that are extracted from a tiled map. */
export enum TmxLayerKind {
  /** Layer contains tiles arranged on a grid. */
  Tiles,
  /** Layer contains freely placed objects. */
  Objects,
  /** Layer is a group of other layers. */
  Group
}

/** @internal */
export interface BaseLayer<D, K extends TmxLayerKind, P = unknown> extends HasProperties<P> {
  /** Layer data. The shape of this depends on what {@link kind} of layer this is. */
  data: D;
  /** Determines what kind of {@link data} is contained in this map. */
  kind: K;
  /** Custom name. */
  name: string;
  /** Custom type. In tiled, this is the "class" property on a layer. */
  type?: string;
  /** Determines if the layer should be visible. */
  isVisible: boolean;
}

/**
 * Layer that contains freely placed objects.
 *
 * - `P`: Custom properties.
 */
export type TmxObjectLayer<P = {}, O extends TmxObject = TmxObject> = BaseLayer<O[], TmxLayerKind.Objects, P>;

/**
 * Layer that contains tiles.
 *
 - `P`: Custom properties.
 */
export type TmxTileLayer<P = {}> = BaseLayer<TileChunk[], TmxLayerKind.Tiles, P>;

/**
 * Layer that groups multiple layers together. This counts as its own layer and can have
 * its own custom properties etc.
 *
 - `P`: Custom properties.
 */
export type TmxLayerGroup<P = {}> = BaseLayer<(TmxLayerGroup | TmxObjectLayer | TmxTileLayer)[], TmxLayerKind.Group, P>;

/**
 * A layer that can occur on a {@link TmxMapAsset map}.
 *
 * - `P`: Custom properties.
 */
export type TmxLayer<P = {}> = TmxLayerGroup<P> | TmxObjectLayer<P> | TmxTileLayer<P>;


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
 * fall within the specified boundaries. Objects are parsed in the process.
 *
 * @param layer Layer data that should be parsed
 * @param bounds Boundaries in pixels that determine which objects will be included
 * @param config Parser config
 */
export function createEntityLayer(layer: TmxObjectLayerData, bounds: Rectangle, config: ParserConfig): ChunkEntityLayer {
  const objects = [];

  for (const item of layer.objects) {
    if (bounds.contains(item.x, item.y)) {
      objects.push(parseObjectData(item, config));
    }
  }

  const props = getCustomProps<ChunkLayerProps>(layer);

  return {
    type: ChunkLayerType.Entities,
    data: objects,
    name: layer.name,
    props,
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
export function createTileLayer(layer: TmxInfiniteTileLayerData, grid: Grid, x: number, y: number): ChunkTileLayer | undefined {
  // Find the equivalent chunk in the tile layer. Tiled stores the chunk position as
  // a pixel position rather than a grid location, so we need to convert it first.
  const chunk = layer.chunks.find(chunk =>
    chunk.x / grid.cols === x &&
    chunk.y / grid.rows === y
  );

  const props = getCustomProps<ChunkLayerProps>(layer);

  if (chunk) {
    return {
      type: ChunkLayerType.Tiles,
      data: chunk.data,
      name: layer.name,
      props,
    };
  }
}

/**
 * @param map Map data from which layers are parsed
 * @param grid Tile grid of a chunk
 * @param x Chunk coordinate along the x-axis
 * @param y Chunk coordinate along the y-axis
 * @param config Parser config
 */
export function parseLayers(map: TmxInfiniteMap, grid: Grid, x: number, y: number, config: ParserConfig): ChunkLayer[] {
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

