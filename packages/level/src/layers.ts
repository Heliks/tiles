import { EntityData } from '@heliks/tiles-engine';
import { LayerId as RenderLayerId } from '@heliks/tiles-pixi';
import { LevelObject } from './objects';


/** Available types of chunk layers. */
export enum LayerType {
  /**
   * Tile grid layer.
   *
   * Contains global tile IDs that define which tiles occupy a chunk's tile grid. Each
   * tile ID references a tile from one of the tilesets available on the level.
   */
  Tiles,
  /**
   * Object definition layer.
   *
   * Contains {@link LevelObject} definitions that are converted into entities. After
   * they are spawned, these objects behave like regular runtime entities.
   */
  Objects,
  /**
   * Serialized entity layer.
   *
   * Contains serialized {@link EntityData} entries that are deserialized and spawned
   * into the world when the chunk is loaded.
   */
  Entities
}

/**
 * Defines a layer available to a level.
 *
 * A level layer describes the kind of data a chunk may store for this layer. The actual
 * layer data is stored per chunk.
 *
 * @template T Layer type
 */
export interface Layer<T extends LayerType = LayerType> {

  /** Unique identifier. */
  id: number;

  /** ID of the renderer layer where this level layer should be rendered */
  renderTo?: RenderLayerId;

  /**
   * Custom name of the layer.
   *
   * This is primarily used for editor tooling, debugging, etc. and has no implications
   * on the levels' behavior.
   */
  name: string;

  /**
   * Layer type.
   *
   * This determines which layer data shape is expected for chunks that contain data
   * for this layer.
   */
  type: T;

}

/**
 * Data for a {@link Layer} with the type {@link LayerType.Tiles}.
 *
 * Each number in the array corresponds to a specific tile ID in one of tilesets
 * present on the level. A value of `0` means no tile occupies that index.
 */
export type TileLayerData = number[];

/**
 * Data for a {@link Layer} with the type {@link LayerType.Objects}.
 *
 * Contains all object definitions that are converted into entities when the chunk
 * is being loaded. During runtime, these object entities will be treated like
 * normal entities.
 *
 * Objects may change position and chunk location during gameplay, hence why it's
 * not recommended to use this data as a reference for unloading entities.
 */
export type ObjectsLayerData = LevelObject[];

/**
 * Data for a {@link Layer} with the type {@link LayerType.Entities}.
 *
 * Each entry is serialized {@link EntityData} from which entities are spawned
 * when the chunk is being loaded.
 *
 * Entities may change position and chunk location during gameplay, hence why it's
 * not recommended to use this data as a reference for unloading entities.
 */
export type EntityLayerData = EntityData[];

/**
 * Union type for all available layer types.
 *
 * @see EntityLayerData
 * @see ObjectsLayerData
 * @see TileLayerData
 */
export type LayerData = EntityLayerData | ObjectsLayerData | TileLayerData;

/**
 * Map that contains local data for a {@link Layer}, keyed by the ID of the layer
 * to which the data belongs.
 */
export type LayerDataMap = {
  [layerId: number]: LayerData
};
