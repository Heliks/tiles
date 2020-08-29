import { TmxLayer, TmxLayerType, TmxObjectLayer } from './tmx-json';
import { Struct } from '@heliks/tiles-engine';
import { Layer, LayerGroup, ObjectLayer, TileLayer } from '@heliks/tiles-tilemap';
import { tmxConvertObjectToTile } from './objects';
import { tmxParseProperties } from './properties';

export interface LayerProperties extends Struct {

  /**
   * If set to `true` the layer counts as a floor, which means that the player character
   * can be spawned on it.
   */
  isFloorLayer?: boolean;

  /**
   * If this property is set to `true` the complete layer will be converted to a single
   * world object. The world object is then added to the `ObjectLayer` that came before
   * this one.
   *
   * This is a workaround for the fact that tiled does not support objects being composed
   * of more than one tile.
   */
  isWorldObject?: boolean;

}

/** @internal */
/*
function assignLayerDataToTile(data: TmxLayer, target: TileComposition): TileComposition {
  switch (data.type) {
    case TmxLayerType.Tiles:
      target.data.push(new TileLayer(data.data));
      break;
    case TmxLayerType.Group:
      for (const child of data.layers) {
        assignLayerDataToTile(child, target);
      }
      break;
    default:
      throw new Error(`Tried to assign data of layer of type ${data.type} to multi tile. 
      Multi tiles can only be created from tile layers or layer groups with only tile 
      layers as children`);
  }

  return target;
}
*/
/**
 * Creates a `TileComposition` from the given layer `data`.
 *
 * Only tile layers and layer groups with only tile layers as children can be converted
 * to a tile composition. Throws an error if anything else is passed.
 */
/*
function convertLayerToTile(data: TmxLayer, grid: Grid): TileComposition {
  const multi = new TileComposition(-1, grid);

  assignLayerDataToTile(data, multi);

  // Shrink the multi tile bounds down to only the visible parts.
  multi.shrink = true;

  return multi;
}
*/
/** @internal */
function parseObjectLayer(data: TmxObjectLayer): ObjectLayer {
  const objects = [];

  for (const item of data.objects) {
    // Object is a tile
    if (item.gid) {
      objects.push(tmxConvertObjectToTile(item));
    }
    else {
      console.warn(item);
    }
  }

  // Parse custom properties.
  // const props = tmxParseProperties<LayerProperties>(data);

  return new ObjectLayer(objects);
}

/** Parses TMX layer `data` to a `Layer<Tilemap>`. */
export function tmxParseLayer(data: TmxLayer): Layer {
  switch (data.type) {
    case TmxLayerType.Tiles:
      return new TileLayer(data.data);
    case TmxLayerType.Group:
      return new LayerGroup(data.layers.map(tmxParseLayer));
    case TmxLayerType.Objects:
      return parseObjectLayer(data);
    default:
      throw new Error('Unknown layer type');
  }
}
