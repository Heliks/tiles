import { AssetStorage } from '@heliks/tiles-assets';
import { Entity, Injectable, Transform, Vec2, World } from '@heliks/tiles-engine';
import { RendererConfig, SpriteId, SpriteRender } from '@heliks/tiles-pixi';
import { isTileEntity, LevelEntity, TileEntity } from './entities';
import { EntityFactory } from './entity-factory';
import { isPointGeometry } from './geometry';
import { Chunk, ChunkEntityLayer, Level } from './level';
import { createRigidBody, getTileGeometry } from './physics';
import { TmxTileset } from './tmx-tileset';


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
        // Todo: Broken positions.
        world.attach(entity, createRigidBody([ data ], 1));
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

    // Add physics, if any.
    const shapes = getTileGeometry(local, index);

    if (shapes) {
      // Todo: Broken positions.
      world.attach(entity, createRigidBody(shapes, 1));
    }

    return world.insert(sprite);
  }

  /** Returns the size of the sprite matching `spriteId` in world units. */
  public getSpriteSize(tileset: TmxTileset, spriteId: SpriteId): Vec2 {
    return this.assets
      .resolve(tileset.spritesheet)
      .getSpriteSize(spriteId)
      .scale(1 / this.config.unitSize);
  }

}
