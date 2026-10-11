import { Grid, Rectangle } from '@heliks/tiles-engine';
import { Layer, LayerDataMap, LayerType, ObjectsLayerData, TileLayerData } from '@heliks/tiles-level';
import { LayerId } from '@heliks/tiles-pixi';
import {
  TmxFiniteTileLayerData,
  TmxInfiniteTileLayerData,
  TmxLayerData,
  TmxLayerTypeData,
  TmxMapData,
  TmxObjectLayerData,
  TmxTileLayerData
} from '../tmx';
import { ParserConfig } from './config';
import { parseObjectData } from './objects';
import { getCustomProps } from './props';


/** Default properties for chunk layers that are used by the level system. */
export interface LayerProps {
  /** Defines the renderer layer where this Tiled layer should be rendered. */
  $layer?: LayerId;
}

export function parseLayers(map: TmxMapData): Layer[] {
  return map.layers.map(layer => {
    const { id, name } = layer;

    const props = getCustomProps<LayerProps>(layer);
    const type = getLayerType(layer);

    return {
      renderTo: props.$layer,
      id,
      name,
      type
    };
  });
}

export function parseChunkLayerData(map: TmxMapData, grid: Grid, cx: number, cy: number, config: ParserConfig): LayerDataMap {
  const layers: LayerDataMap = {};

  // Boundaries from where objects are extracted on object layers.
  const bounds = new Rectangle(
    grid.width,
    grid.height,
    grid.width * cx,
    grid.height * cy
  );

  for (const layer of map.layers) {
    let data;

    switch (layer.type) {
      case TmxLayerTypeData.Tiles:
        data = getTileLayerData(layer, grid, cx, cy);
        break;
      case TmxLayerTypeData.Objects:
        data = getObjectsLayerData(layer, bounds, config);
        break;
      default:
        console.warn(`Layer type not supported: ${layer.type}`);
        break;
    }

    if (data) {
      layers[layer.id] = data;
    }
  }

  return layers;
}

/**
 * Returns {@link ObjectsLayerData} from all objects on the given object `layer` that
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
export function getObjectsLayerData(layer: TmxObjectLayerData, bounds: Rectangle, config: ParserConfig): ObjectsLayerData {
  const objects = [];

  for (const item of layer.objects) {
    // Rectangle.contains() is inclusive so we need to do this boundary check manually.
    if (item.x >= bounds.x && item.y >= bounds.y && item.x < bounds.x + bounds.width && item.y < bounds.y + bounds.height) {
      objects.push(parseObjectData(item, config));
    }
  }

  return objects;
}

/**
 * Returns {@link TileLayerData} for the chunk at the given location.
 *
 * This can return `undefined` if the given `layer` data does not contain any tiles for
 * that particular chunk.
 *
 * @param layer TMX Layer data from which tiles will be extracted
 * @param grid Tile grid of a chunk
 * @param cx Location of the chunk on the map grid along x-axis
 * @param cy Location of the chunk on the map grid along y-axis
 */
export function getTileLayerData(layer: TmxTileLayerData, grid: Grid, cx: number, cy: number): TileLayerData | undefined {
  if (isInfiniteLayer(layer)) {
    return layer.data;
  }

  // Find the equivalent chunk in the tile layer. Tiled stores the chunk position as
  // a pixel position rather than a grid location, so we need to convert it first.
  const chunk = layer.chunks.find(chunk => chunk.x / grid.cols === cx && chunk.y / grid.rows === cy);

  if (chunk) {
    return chunk.data;
  }
}

/** @internal */
function isInfiniteLayer(layer: TmxTileLayerData): layer is TmxFiniteTileLayerData {
  return Boolean(! (layer as TmxInfiniteTileLayerData).chunks);
}

/** @internal */
function getLayerType(layer: TmxLayerData): LayerType {
  switch (layer.type) {
    case TmxLayerTypeData.Tiles:
      return LayerType.Tiles;
    case TmxLayerTypeData.Objects:
      return LayerType.Objects;
    default:
      throw new Error(`Layer type not supported: ${layer.type}`);
  }
}



