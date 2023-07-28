import { Grid } from '@heliks/tiles-engine';
import { parseObjectData, TmxObject } from '../tmx-object';
import { parseCustomProperties } from '../tmx-properties';
import { TmxLayerData, TmxLayerTypeData, TmxObjectLayerData, TmxTileLayerData, TmxMapData } from '../../tmx';
import { BaseLayer } from './base-layer';
import { TileChunk } from './tile-chunk';
import { LayerId } from '@heliks/tiles-pixi';


/** Internal that can occur on a {@link TmxLayer layer}. */
export interface LayerProperties {

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

  /**
   * If set to `true`, this layer will be ignored when its map is spawned.
   */
  $skip?: boolean;

}


/** Available layer types. */
export enum TmxLayerType {

  /**
   * Layer contains tiles on a tile grid.
   * @see TmxTileLayer
   */
  Tiles,

  /**
   * Layer contains freely placed objects.
   * @see TmxObjectLayer
   */
  Objects,

  /**
   * Layer is a group that contains other layers.
   * @see TmxLayerGroup
   */
  Group

}

/**
 * Layer that contains freely placed objects.
 *
 * @typeparam P Custom layer properties.
 */
export type TmxObjectLayer<P extends LayerProperties = LayerProperties> = BaseLayer<TmxObject[], TmxLayerType.Objects, P>;

/**
 * Layer that contains tiles.
 *
 * @typeparam P Custom layer properties.
 */
export type TmxTileLayer<P extends LayerProperties = LayerProperties> = BaseLayer<TileChunk[], TmxLayerType.Tiles, P>;

/**
 * Layer that groups multiple layers together. This counts as its own layer and can have
 * its own custom properties etc.
 *
 * @typeparam P Custom layer properties
 */
export type TmxLayerGroup<P extends LayerProperties = LayerProperties> = BaseLayer<(TmxLayerGroup | TmxObjectLayer | TmxTileLayer)[], TmxLayerType.Group, P>;

/**
 * Any valid layer type.
 *
 * @see TmxLayerGroup
 * @see TmxObjectLayer
 * @see TmxTileLayer
 *
 * @typeparam P Custom layer properties.
 */
export type TmxLayer<P extends LayerProperties = LayerProperties> = TmxLayerGroup<P> | TmxObjectLayer<P> | TmxTileLayer<P>;


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
 * @see TmxTileLayer
 */
export function parseTileLayer(layer: TmxTileLayerData, chunkTileGrid: Grid): TmxTileLayer {
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
export function parseLayer(map: TmxMapData, layer: TmxLayerData, chunkTileGrid: Grid): TmxLayer {
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
export function parseLayers(data: TmxMapData, chunkTileGrid: Grid): TmxLayer[] {
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
