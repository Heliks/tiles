import { AssetStorage } from '@heliks/tiles-assets';
import { Entity, Injectable, Transform, Vec2, World } from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';
import { RendererConfig, SpriteAnimation, SpriteId, SpriteRender } from '@heliks/tiles-pixi';
import { isTileEntity, LevelEntity, TileEntity } from './entities';
import { EntityFactory } from './entity-factory';
import { isPointGeometry } from './geometry';
import { Chunk, ChunkEntityLayer, Level } from './level';
import { createPhysicsCollider, createRigidBody, getTileGeometry } from './physics';
import { Tileset } from './tileset';


/**
 * This is the default {@link EntityFactory} used by the level system to create
 * entities. For custom handling of custom objects, this class can be overwritten
 * by setting a factory in the {@link LevelBundle}.
 */
@Injectable()
export class EntityComposer implements EntityFactory {

  /**
   * @param assets {@see AssetStorage}
   * @param config {@see RendererConfig}
   */
  constructor(private readonly assets: AssetStorage, private readonly config: RendererConfig) {}

  /** @inheritDoc */
  public ignore(): boolean {
    return true;
  }

  /** @inheritDoc */
  public create(world: World, level: Level, chunk: Chunk, layer: ChunkEntityLayer, data: LevelEntity): Entity {
    let entity;

    if (isTileEntity(data)) {
      entity = this.createTileEntity(world, level, layer, data);
    }
    else {
      entity = world.insert();

      // Point geometry has a size of 0/0, if we don't ignore it, there will be a bunch
      // of invisible colliders scattered around the world.
      if (! isPointGeometry(data)) {
        const collider = createPhysicsCollider(data);

        // We need to reset the position of the collider shape here because the geometry
        // is the body itself. The body will be positioned by a transform component.
        collider.shape.x = 0;
        collider.shape.y = 0;

        world.attach(entity, new RigidBody().attach(collider));
      }
    }

    // Attach world position.
    world.attach(entity, new Transform(data.shape.x, data.shape.y));

    return entity;
  }

  public createTileEntity(world: World, level: Level, layer: ChunkEntityLayer, data: TileEntity): Entity {
    const local = level.tilesets.getFromGlobalId(data.tileId);
    const index = local.getLocalIndex(data.tileId);

    const sprite = new SpriteRender(local.tileset.spritesheet, index, layer.props.$layer);

    sprite.flip(data.flipX, data.flipY);
    sprite.setAnchor(local.tileset.pivot.x, local.tileset.pivot.y);

    // If the size of the sprite doesn't match the entities' shape, it was manually
    // scaled. Calculate the scale factor.
    const size = this.getSpriteSize(local.tileset, index);

    sprite.scale.x = data.shape.width / size.x;
    sprite.scale.y = data.shape.height / size.y;

    const entity = world.insert(sprite);
    const shapes = getTileGeometry(local, index);

    if (shapes) {
      // Todo: Broken positions.
      world.attach(entity, createRigidBody(shapes, 1));
    }

    const animation = local.tileset.getAnimationName(index);

    if (animation) {
      world.attach(entity, new SpriteAnimation().play(animation));
    }

    return entity;
  }

  /** Returns the size of the sprite matching `spriteId` in world units. */
  public getSpriteSize(tileset: Tileset, spriteId: SpriteId): Vec2 {
    return this.assets
      .resolve(tileset.spritesheet)
      .getSpriteSize(spriteId)
      .scale(1 / this.config.unitSize);
  }

}
