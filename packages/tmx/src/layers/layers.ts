import { Grid } from '@heliks/tiles-engine';
import { GameObject, parseObject } from '../tmx-game-object';
import { parseCustomProperties, TmxProperties } from '../tmx-properties';
import { TmxLayerData, TmxLayerTypeData, TmxObjectLayerData, TmxTileLayerData, TmxTilemapData } from '../tmx';
import { BaseLayer } from './base-layer';
import { TileChunk } from './tile-chunk';
import { LayerId } from '@heliks/tiles-pixi';


/** Internal {@link TmxProperties properties} that can occur on a {@link Layer layer}. */
export interface LayerProperties extends TmxProperties {

  /**
   * If defined, the TMX layer will be rendered on the renderer {@link LayerId layer}
   * using this ID. Subsequent layers will inherit this setting. For example:
   *
   * ```
   *  - Layer1 with $layer 1   -> renderer layer 1
   *  - Layer2                 -> renderer layer 1
   *  - Layer3 with $layer 2   -> renderer layer 2
   *  - Layer4                 -> renderer layer 2
   *  - Layer5 with $layer 1   -> renderer layer 1
   *  ...
   * ```
   */
  $layer?: LayerId;

}


/** Available layer types. */
export enum TmxLayerType {

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
export type ObjectLayer<P extends LayerProperties = LayerProperties> = BaseLayer<GameObject[], TmxLayerType.Objects, P>;

/**
 * Layer that contains tiles.
 *
 * @typeparam P Custom layer properties.
 */
export type TileLayer<P extends LayerProperties = LayerProperties> = BaseLayer<TileChunk[], TmxLayerType.Tiles, P>;

/**
 * Layer that groups multiple layers together. This counts as its own layer and can have
 * its own custom properties etc.
 *
 * @typeparam P Custom layer properties
 */
export type LayerGroup<P extends LayerProperties = LayerProperties> = BaseLayer<(LayerGroup | ObjectLayer | TileLayer)[], TmxLayerType.Group, P>;

/**
 * Any valid layer type.
 *
 * @see LayerGroup
 * @see ObjectLayer
 * @see TileLayer
 *
 * @typeparam P Custom layer properties.
 */
export type Layer<P extends LayerProperties = LayerProperties> = LayerGroup<P> | ObjectLayer<P> | TileLayer<P>;


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
    properties: parseCustomProperties(layer),
    type: TmxLayerType.Objects
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
    properties: parseCustomProperties(layer),
    type: TmxLayerType.Tiles
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
export function parseLayer(map: TmxTilemapData, layer: TmxLayerData, chunkTileGrid: Grid): Layer {
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
        properties: parseCustomProperties(layer),
        type: TmxLayerType.Group
      };
  }
}

/**
 * @param data Tilemap data.
 * @param chunkTileGrid Grid that determines how tiles should be arranged in chunks.
 *  Required to parse tile layers.
 */
export function parseLayers(data: TmxTilemapData, chunkTileGrid: Grid): Layer[] {
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
