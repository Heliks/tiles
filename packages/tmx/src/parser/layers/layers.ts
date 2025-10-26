import { Grid } from '@heliks/tiles-engine';
import { MapAssetChunkLayer, MapAssetChunkLayerType } from '../../level';
import {
  TmxInfiniteMap,
  TmxInfiniteTileLayerData,
  TmxLayerData,
  TmxLayerTypeData,
  TmxMapData,
  TmxObjectLayerData,
  TmxTileLayerData
} from '../../tmx';
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
 * Creates a {@link MapChunkTileLayer} for the chunk at the given location. This can
 * return `undefined` if the given `layer` data does not contain any tiles for that
 * particular chunk.
 *
 * @param layer TMX Layer data from which tiles will be extracted.
 * @param layout The layout of a map chunk.
 * @param x Location of the chunk on the map grid along x-axis.
 * @param y Location of the chunk on the map grid along y-axis.
 */
export function createChunkTiles(layer: TmxInfiniteTileLayerData, layout: Grid, x: number, y: number): MapAssetChunkLayer | undefined {
  // Find the equivalent chunk in the tile layer. Tiled stores the chunk position as
  // a pixel position rather than a grid location, so we need to convert it first.
  const chunk = layer.chunks.find(chunk =>
    chunk.x / layout.cols === x &&
    chunk.y / layout.rows === y
  );

  if (chunk) {
    return {
      type: MapAssetChunkLayerType.Tiles,
      data: chunk.data,
      props: getCustomProps(layer),
    };
  }
}

export function parseLayers2(map: TmxInfiniteMap, layout: Grid, x: number, y: number): MapAssetChunkLayer[] {
  const layers = [];

  for (const data of map.layers) {
    switch (data.type) {
      case TmxLayerTypeData.Tiles:
        const layer = createChunkTiles(data, layout, x, y);

        // Important: Extracting a tile layer can fail if the layer data did not have
        // any tiles for our particular chunk.
        if (layer) {
          layers.push(layer);
        }

        break;
    }
  }

  return layers;
}

/**
 * Parses a TMX tile `layer`.
 *
 * @param layer Layer data that should be parsed.
 * @param chunkTileGrid Grid that determines how tiles should be arranged in chunks.
 *  Required to parse tile layers.
 * @see TmxTileLayer
 */
export function parseTileLayerOld(layer: TmxTileLayerData, chunkTileGrid: Grid): TmxTileLayer {
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
    properties: getCustomProps(layer),
    type: layer.class,
    kind: TmxLayerKind.Tiles
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
      return parseTileLayerOld(layer, chunkTileGrid);
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
        properties: getCustomProps(layer),
        type: layer.class,
        kind: TmxLayerKind.Group
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
