import { TmxObject } from '../tmx-object';
import { HasProperties } from '../tmx-properties';
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
 * @typeparam P Custom layer properties.
 */
export type TmxObjectLayer<P = unknown> = BaseLayer<TmxObject[], TmxLayerKind.Objects, P>;

/**
 * Layer that contains tiles.
 *
 * @typeparam P Custom layer properties.
 */
export type TmxTileLayer<P = unknown> = BaseLayer<TileChunk[], TmxLayerKind.Tiles, P>;

/**
 * Layer that groups multiple layers together. This counts as its own layer and can have
 * its own custom properties etc.
 *
 * @typeparam P Custom layer properties
 */
export type TmxLayerGroup<P = unknown> = BaseLayer<(TmxLayerGroup | TmxObjectLayer | TmxTileLayer)[], TmxLayerKind.Group, P>;

/**
 * Any valid layer type.
 *
 * @see TmxLayerGroup
 * @see TmxObjectLayer
 * @see TmxTileLayer
 *
 * @typeparam P Custom layer properties.
 */
export type TmxLayer<P = unknown> = TmxLayerGroup<P> | TmxObjectLayer<P> | TmxTileLayer<P>;



