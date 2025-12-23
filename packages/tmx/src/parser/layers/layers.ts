import { Grid, Rectangle } from '@heliks/tiles-engine';
import { ChunkEntityLayer, ChunkLayer, ChunkLayerProps, ChunkLayerType } from '../../level';
import { TmxInfiniteMap, TmxInfiniteTileLayerData, TmxLayerTypeData, TmxObjectLayerData } from '../../tmx';
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
 * Parses a TMX tile `layer`.
 *
 * @param layer Layer data that should be parsed.
 * @see TmxObjectLayer
 */
export function parseObjectLayer(layer: TmxObjectLayerData): TmxObjectLayer {
  const objects = [];

  for (const item of layer.objects) {
    objects.push(parseObjectData(item));
  }

  return {
    name: layer.name,
    data: objects,
    isVisible: layer.visible,
    properties: getCustomProps(layer),
    type: layer.class,
    kind: TmxLayerKind.Objects
  };
}

/**
 * Creates a {@link ChunkLayer} for the chunk at the given location. This can
 * return `undefined` if the given `layer` data does not contain any tiles for
 * that particular chunk.
 *
 * @param layer TMX Layer data from which tiles will be extracted.
 * @param layout The layout of a map chunk.
 * @param x Location of the chunk on the map grid along x-axis.
 * @param y Location of the chunk on the map grid along y-axis.
 */
export function createChunkTiles(layer: TmxInfiniteTileLayerData, layout: Grid, x: number, y: number): ChunkLayer | undefined {
  // Find the equivalent chunk in the tile layer. Tiled stores the chunk position as
  // a pixel position rather than a grid location, so we need to convert it first.
  const chunk = layer.chunks.find(chunk =>
    chunk.x / layout.cols === x &&
    chunk.y / layout.rows === y
  );

  const props = getCustomProps<ChunkLayerProps>(layer);

  if (chunk) {
    return {
      layerId: props.$layer,
      type: ChunkLayerType.Tiles,
      data: chunk.data,
      name: layer.name,
      props,
    };
  }
}

/**
 * @param map
 * @param layout
 * @param x Coordinate along the x-axis of the chunk.
 * @param y Coordinate along the y-axis of the chunk.
 */
export function parseLayers2(map: TmxInfiniteMap, layout: Grid, x: number, y: number): ChunkLayer[] {
  const layers = [];

  const cx = x * layout.width;
  const cy = y * layout.height;

  const bounds = new Rectangle(layout.width, layout.height, cx, cy);

  for (const data of map.layers) {
    switch (data.type) {
      case TmxLayerTypeData.Tiles:
        const layer = createChunkTiles(data, layout, x, y);

        // Important: Extracting a tile layer can return undefined if the layer data did
        // not have any tiles for our particular chunk. In that case, skip the layer.
        if (layer) {
          layers.push(layer);
        }

        break;
      case TmxLayerTypeData.Objects:
        const objects = [];

        for (const item of data.objects) {
          if (bounds.contains(item.x, item.y)) {
            objects.push(parseObjectData(item));
          }
        }

        const props = getCustomProps<ChunkLayerProps>(data);

        layers.push({
          layerId: props.$layer,
          type: ChunkLayerType.Entities,
          data: objects,
          name: data.name,
          props,
        } as ChunkEntityLayer);

        break;
      default:
        console.warn(`Layer type not supported: ${data.type}`);
    }
  }

  return layers;
}

