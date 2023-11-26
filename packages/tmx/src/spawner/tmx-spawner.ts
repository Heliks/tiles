import { Entity, EventQueue, Injectable, Parent, token, Transform, World } from '@heliks/tiles-engine';
import { LayerId } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import { TmxLayer, TmxLayerType, TmxMapAsset, TmxObjectLayer, TmxTileLayer } from '../parser';
import { TmxObjectFactory } from './objects';
import { TmxObjectSpawner } from './objects/tmx-object-spawner';
import { TmxLayerRoot } from './tmx-layer-root';
import { TmxSpawnMap } from './tmx-spawn-map';


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

export const DEFAULT_OBJECT_FACTORY = token<TmxObjectFactory>();

/**
 * Service that spawns {@link TmxMapAsset maps}.
 *
 * - `P`: Interface for custom properties that are found on spawned maps.
 * - `T`: Subtype for tilemap that is spawned.
 */
@Injectable()
export class TmxSpawner<T extends TmxMapAsset = TmxMapAsset> {

  /**
   * Every time a {@link TmxMapAsset map} is fully {@link spawn spawned}, it will be
   * pushed to this event queue. This also includes maps that are re-spawned.
   */
  public readonly onMapSpawned = new EventQueue<T>();

  constructor(private readonly objects: TmxObjectSpawner) {}

  /** @internal */
  private async spawnObjectLayer(world: World, root: Entity, map: T, layer: TmxObjectLayer): Promise<void> {
    await Promise.all(
      layer.data.map(item => this.objects.spawn(world, root, map, layer, item))
    );
  }

  /** @internal */
  public async spawnLayer(world: World, map: T, layer: TmxLayer, renderLayer?: LayerId): Promise<Entity> {
    const entity = world
      .create()
      .use(new TmxLayerRoot(layer))
      .use(new Transform(0, 0))
      .build();

    switch (layer.type) {
      case TmxLayerType.Tiles:
        spawnTileLayer(world, entity, map, layer, renderLayer);
        break;
      case TmxLayerType.Objects:
        await this.spawnObjectLayer(world, entity, map, layer);
        break;
      default:
        throw new Error(`Unsupported layer type ${layer.type}`);
    }

    return entity;
  }

  /**
   * Spawns a {@link TmxMapAsset map}.
   *
   * If a `parent` entity is given, entities that are created in the process will be
   * children of that parent.
   */
  public async spawn(world: World, map: T, parent?: Entity): Promise<void> {
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
        world.add(entity, new Parent(parent));

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
