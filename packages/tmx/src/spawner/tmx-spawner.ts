import { Entity, EventQueue, Injectable, Parent, token, Transform, World } from '@heliks/tiles-engine';
import { LayerId } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import { TmxLayer, TmxLayerKind, TmxMapAsset, TmxObjectLayer, TmxTileLayer } from '../parser';
import { TmxObjectSpawner } from './tmx-object-spawner';
import { TmxObjectType } from './tmx-object-type';
import { TmxSpawnMap } from './tmx-spawn-map';


/** Spawner properties for {@link TmxLayer layers}. */
export interface SpawnLayerProperties {

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

/** @internal */
function spawnTileLayer(world: World, entity: Entity, map: TmxMapAsset, layer: TmxTileLayer, renderLayer?: LayerId): void {
  for (const chunk of layer.data) {
    const tilemap = new Tilemap(chunk.grid, renderLayer);

    tilemap.tilesets.copy(map.tilesets);
    tilemap.setAll(chunk.data);

    world
      .create()
      .use(tilemap)
      .use(new Parent(entity))
      .use(new Transform())
      .build();
  }
}

export const DEFAULT_OBJECT_FACTORY = token<TmxObjectType>();


/** @see TmxMapAsset */
export type SpawnableAsset<P = unknown> = TmxMapAsset<P, TmxLayer<SpawnLayerProperties>>;

/**
 * Service that spawns {@link TmxMapAsset maps}.
 */
@Injectable()
export class TmxSpawner<M extends SpawnableAsset = SpawnableAsset> {

  /**
   * Every time a {@link TmxMapAsset map} is fully {@link spawn spawned}, it will be
   * pushed to this event queue. This also includes maps that are re-spawned.
   */
  public readonly onMapSpawned = new EventQueue<M>();

  constructor(private readonly objects: TmxObjectSpawner) {}

  /** @internal */
  private async spawnObjectLayer(world: World, map: M, layer: TmxObjectLayer): Promise<void> {
    await Promise.all(
      layer.data.map(item => this.objects.spawn(world, map, layer, item))
    );
  }

  /** @internal */
  public async spawnLayer(world: World, map: M, layer: TmxLayer, renderLayer?: LayerId): Promise<Entity> {
    const entity = world.create().use(new Transform()).build();

    switch (layer.kind) {
      case TmxLayerKind.Tiles:
        spawnTileLayer(world, entity, map, layer, renderLayer);
        break;
      case TmxLayerKind.Objects:
        await this.spawnObjectLayer(world, map, layer);
        break;
      default:
        throw new Error(`Unsupported layer type ${layer.kind}`);
    }

    return entity;
  }

  /**
   * Spawns a {@link TmxMapAsset map}.
   *
   * If a `parent` entity is given, entities that are created in the process will be
   * children of that parent.
   */
  public async spawn(world: World, map: M, parent?: Entity): Promise<void> {
    let renderLayer;

    for (const data of map.layers) {
      if (data.properties.$skip) {
        continue;
      }

      if (data.properties.$layer) {
        renderLayer = data.properties.$layer;
      }

      // Fixme: Should not await in loops...
      const entity = await this.spawnLayer(world, map, data, renderLayer);

      if (parent !== undefined) {
        // Set layer root as child of parent entity.
        world.attach(entity, new Parent(parent));

        // Add entity to spawner layers.
        world
          .storage(TmxSpawnMap)
          .get(parent)
          .layers
          .push(entity);
      }
    }

    this.onMapSpawned.push(map);
  }

}
