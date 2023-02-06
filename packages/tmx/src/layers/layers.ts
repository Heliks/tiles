import { Grid } from '@heliks/tiles-engine';
import { GameObject, parseObject } from '../objects';
import { getCustomProperties, Properties } from '../properties';
import { TmxLayerData, TmxLayerTypeData, TmxObjectLayerData, TmxTileLayerData, TmxTilemap } from '../tmx';
import { BaseLayer } from './base-layer';
import { TileChunk } from './tile-chunk';


/** Available layer types. */
export enum LayerType {

  /**
   * Layer contains tiles on a tile grid.
   * @see TileLayer
   */
  Tiles,

  /**
   * Layer contains freely placed objects.
   * @see ObjectLayer
   */
  Objects,

  /**
   * Layer is a group that contains other layers.
   * @see LayerGroup
   */
  Group

}

/**
 * Layer that contains freely placed objects.
 *
 * @typeparam P Custom layer properties.
 */
export type ObjectLayer<P extends Properties = Properties> = BaseLayer<GameObject[], LayerType.Objects, P>;

/**
 * Layer that contains tiles.
 *
 * @typeparam P Custom layer properties.
 */
export type TileLayer<P extends Properties = Properties> = BaseLayer<TileChunk[], LayerType.Tiles, P>;

/**
 * Layer that groups multiple layers together. This counts as its own layer and can have
 * its own custom properties etc.
 *
 * @typeparam P Custom layer properties
 */
export type LayerGroup<P extends Properties = Properties> = BaseLayer<(LayerGroup | ObjectLayer | TileLayer)[], LayerType.Group, P>;

/**
 * Any valid layer type.
 *
 * @see LayerGroup
 * @see ObjectLayer
 * @see TileLayer
 *
 * @typeparam P Custom layer properties.
 */
export type Layer<P extends Properties = Properties> = LayerGroup<P> | ObjectLayer<P> | TileLayer<P>;


/**
 * Parses a TMX tile `layer`.
 *
 * @param layer Layer data that should be parsed.
 * @see ObjectLayer
 */
export function parseObjectLayer(layer: TmxObjectLayerData): ObjectLayer {
  const objects = [];

  for (const item of layer.objects) {
    objects.push(parseObject(item));
  }

  return {
    name: layer.name,
    data: objects,
    isVisible: layer.visible,
    properties: getCustomProperties(layer),
    type: LayerType.Objects
  };
}

/**
 * Parses a TMX tile `layer`.
 *
 * @param layer Layer data that should be parsed.
 * @param chunkTileGrid Grid that determines how tiles should be arranged in chunks.
 *  Required to parse tile layers.
 * @see TileLayer
 */
export function parseTileLayer(layer: TmxTileLayerData, chunkTileGrid: Grid): TileLayer {
  const chunks = [];

  if (layer.chunks) {
    for (const chunk of layer.chunks) {
      chunks.push(new TileChunk(
        chunkTileGrid,
        chunk.data,
        chunk.x,
        chunk.y
      ));
    }
  }
  else {
    chunks.push(new TileChunk(chunkTileGrid, layer.data, 0, 0));
  }

  return {
    name: layer.name,
    data: chunks,
    isVisible: layer.visible,
    properties: getCustomProperties(layer),
    type: LayerType.Tiles
  };
}

/**
 * Parses a TMX `layer`.
 *
 * @param map Map data that contains the `layer`.
 * @param layer Layer data that should be parsed.
 * @param chunkTileGrid Grid that determines how tiles should be arranged in chunks.
 *  Required to parse tile layers.
 */
export function parseLayer(map: TmxTilemap, layer: TmxLayerData, chunkTileGrid: Grid): Layer {
  switch (layer.type) {
    case TmxLayerTypeData.Tiles:
      return parseTileLayer(layer, chunkTileGrid);
    case TmxLayerTypeData.Objects:
      return parseObjectLayer(layer);
    case TmxLayerTypeData.Group:
      const layers = layer.layers.map(item => parseLayer(
        map,
        item,
        chunkTileGrid
      ));

      return {
        name: layer.name,
        data: layers,
        isVisible: layer.visible,
        properties: getCustomProperties(layer),
        type: LayerType.Group
      };
  }
}

/**
 * @param data Tilemap data.
 * @param chunkTileGrid Grid that determines how tiles should be arranged in chunks.
 *  Required to parse tile layers.
 */
export function parseLayers(data: TmxTilemap, chunkTileGrid: Grid): Layer[] {
  const layers = [];

  for (const layer of data.layers) {
    layers.push(parseLayer(
      data,
      layer,
      chunkTileGrid
    ));
  }

  return layers;
}
