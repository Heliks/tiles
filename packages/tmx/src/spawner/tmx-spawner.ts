import { AssetStorage } from '@heliks/tiles-assets';
import { Entity, EntityBuilder, EventQueue, Injectable, Parent, Transform, Vec2, World } from '@heliks/tiles-engine';
import { LayerId, SpriteRender } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import {
  isTile,
  Layer,
  ObjectLayer,
  TileLayer,
  TmxLayerType,
  TmxMapAsset,
  TmxObject,
  TmxProperties,
  TmxTileObject,
  TmxTileset
} from '../parser';
import { TmxPhysicsFactory } from './tmx-physics-factory';
import { TmxSpawnerConfig } from './tmx-spawner-config';


/** @internal */
function spawnTileLayer(world: World, map: TmxMapAsset, layer: TileLayer, renderLayer?: LayerId): Entity {
  const entity = world.create(new Transform());

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

  return entity;
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
   */
  constructor(
    private readonly assets: AssetStorage,
    private readonly config: TmxSpawnerConfig,
    private readonly physics: TmxPhysicsFactory
  ) {}

  /** @internal */
  private getSpriteSize(tileset: TmxTileset, spriteIdx: number): Vec2 {
    return this.assets.resolve(tileset.spritesheet).data.getSpriteSize(spriteIdx);
  }

  /**
   * Returns the scale factor of the sprite at the given `spriteIdx` when used for
   * as sprite for a {@link TmxTileObject tile}.
   */
  public getScaleFactor(tileset: TmxTileset, obj: TmxTileObject, spriteIdx: number): Vec2 {
    const size = this.getSpriteSize(tileset, spriteIdx);

    size.x = obj.shape.width / size.x;
    size.y = obj.shape.height / size.y;

    return size;
  }

  /** @internal */
  private createObjectSprite(tileset: TmxTileset, obj: TmxTileObject, spriteId: number, renderLayer?: LayerId): SpriteRender {
    const sprite = new SpriteRender(tileset.spritesheet, spriteId, renderLayer);

    sprite.scale.copy(this.getScaleFactor(tileset, obj, spriteId));

    sprite.flip(obj.flipX, obj.flipY);
    sprite.setAnchor(tileset.pivot.x, tileset.pivot.y);

    return sprite;
  }

  /** @internal */
  private createObjectBuilder(world: World, map: T, obj: TmxObject, renderLayer?: LayerId): EntityBuilder {
    let x = obj.shape.x;
    let y = obj.shape.y;

    const entity = world.builder();

    if (isTile(obj)) {
      const tileset = map.tilesets.getFromGlobalId(obj.tileId);
      const tileId  = tileset.getLocalId(obj.tileId);

      entity.use(
        this.createObjectSprite(
          tileset.tileset,
          obj,
          tileId - 1,
          renderLayer
        )
      );
    }
    else {
      entity.use(this.physics.body(obj));
    }

    // The object position we received from tiled is relative to the top left corner
    // of the map. Re-align position to world space & apply unit size.
    x = (x / this.config.unitSize) - (map.grid.cols / 2);
    y = (y / this.config.unitSize) - (map.grid.rows / 2);

    entity.use(new Transform(0, 0, 0, x, y));

    return entity;
  }

  /** @internal */
  private spawnObjectLayer(world: World, map: T, layer: ObjectLayer, renderLayer?: LayerId): Entity {
    const parent = world.create(new Transform(10, 10));

    for (const obj of layer.data) {
      this.createObjectBuilder(world, map, obj, renderLayer).use(new Parent(parent)).build();
    }

    return parent;
  }

  /** @internal */
  public spawnLayer(world: World, map: T, layer: Layer, renderLayer?: LayerId): Entity {
    switch (layer.type) {
      case TmxLayerType.Tiles:
        return spawnTileLayer(world, map, layer, renderLayer);
      case TmxLayerType.Objects:
        return this.spawnObjectLayer(world, map, layer, renderLayer);
      default:
        throw new Error(`Unsupported layer type ${layer.type}`);
    }
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

      if (parent) {
        world.add(entity, new Parent(parent));
      }
    }

    this.onMapSpawned.push(map);
  }

}
