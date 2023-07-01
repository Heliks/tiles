import { AssetStorage } from '@heliks/tiles-assets';
import { Entity, EventQueue, Injectable, Parent, Transform, World } from '@heliks/tiles-engine';
import { LayerId } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import { TmxLayer, TmxLayerType, TmxMapAsset, TmxObject, TmxObjectLayer, TmxProperties, TmxTileLayer } from '../parser';
import { TmxObjectType, TmxObjectTypes } from './objects';
import { TmxLayerRoot } from './tmx-layer-root';
import { TmxPhysicsFactory } from './tmx-physics-factory';
import { TmxSpawnMap } from './tmx-spawn-map';
import { TmxSpawnerConfig } from './tmx-spawner-config';


/** @internal */
function spawnTileLayer(world: World, entity: Entity, map: TmxMapAsset, layer: TmxTileLayer, renderLayer?: LayerId): void {
  for (const chunk of layer.data) {
    const tilemap = new Tilemap(chunk.grid, renderLayer);

    tilemap.tilesets.copy(map.tilesets);
    tilemap.setAll(chunk.data);

    world
      .builder()
      .use(tilemap)
      .use(new Parent(entity))
      .use(new Transform())
      .build();
  }
}


/**
 * Service that spawns {@link TmxMapAsset maps}.
 *
 * - `P`: Interface for custom properties that are found on spawned maps.
 * - `T`: Subtype for tilemap that is spawned.
 */
@Injectable()
export class TmxSpawner<P extends TmxProperties = TmxProperties, T extends TmxMapAsset = TmxMapAsset<P>> {

  /**
   * Every time a {@link TmxMapAsset map} is fully {@link spawn spawned}, it will be
   * pushed to this event queue. This also includes maps that are re-spawned.
   */
  public readonly onMapSpawned = new EventQueue<T>();

  /**
   * @param assets {@see AssetStorage}
   * @param config {@see TmxConfig}
   * @param physics {@see PhysicsFactory}
   * @param types {@see TmxObjectTypes}
   */
  constructor(
    private readonly assets: AssetStorage,
    private readonly config: TmxSpawnerConfig,
    private readonly physics: TmxPhysicsFactory,
    private readonly types: TmxObjectTypes
  ) {}

  /** Returns the appropriate {@link TmxObjectType} for the given `obj`. */
  private getObjectType(world: World, obj: TmxObject): TmxObjectType {
    if (obj.type) {
      const type = this.types.items.get(obj.type);

      if (type) {
        return type;
      }
    }

    return this.types.def;
  }

  /** @internal */
  private spawnObjectLayer(world: World, root: Entity, map: T, layer: TmxObjectLayer, renderLayer?: LayerId): Entity {
    for (const obj of layer.data) {
      const type = this.getObjectType(world, obj);
      const entity = world.builder();

      type.compose(world, entity, map, layer, obj);

      entity
        .use(new Parent(root))
        .build();
    }

    return root;
  }

  /** @internal */
  public spawnLayer(world: World, map: T, layer: TmxLayer, renderLayer?: LayerId): Entity {
    const entity = world
      .builder()
      .use(new TmxLayerRoot(layer))
      .use(new Transform(0, 0))
      .build();

    switch (layer.type) {
      case TmxLayerType.Tiles:
        spawnTileLayer(world, entity, map, layer, renderLayer);
        break;
      case TmxLayerType.Objects:
        this.spawnObjectLayer(world, entity, map, layer, renderLayer);
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
  public spawn(world: World, map: T, parent?: Entity): void {
    let renderLayer;

    for (const data of map.layers) {
      if (data.properties.$skip) {
        continue;
      }

      if (data.properties.$layer) {
        renderLayer = data.properties.$layer;
      }

      const entity = this.spawnLayer(world, map, data, renderLayer);

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
