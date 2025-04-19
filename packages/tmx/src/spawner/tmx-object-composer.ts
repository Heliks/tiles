import { AssetStorage } from '@heliks/tiles-assets';
import { EntityBuilder, Injectable, Rectangle, Vec2, World } from '@heliks/tiles-engine';
import { LayerId, SpriteId, SpriteRender } from '@heliks/tiles-pixi';
import { LocalTileset } from '@heliks/tiles-tilemap';
import { isTile, TmxCustomTile, TmxGeometry, TmxMapAsset, TmxObject, TmxTileObject, TmxTileset } from '../parser';
import { TmxPhysicsFactory, TmxPhysicsOptions } from './tmx-physics-factory';


/** @internal */
function getTileShapes(local: LocalTileset, tileIdx: number): TmxGeometry[] | undefined {
  const tile = local.tileset.tile<TmxCustomTile<unknown, TmxPhysicsOptions>>(tileIdx);

  if (tile && tile.shapes && tile.shapes.length > 0) {
    return tile.shapes;
  }
}

/** @internal */
function isPointGeometry(geometry: TmxGeometry): boolean {
  return geometry.shape instanceof Rectangle
    && geometry.shape.width === 0
    && geometry.shape.height === 0;
}

/** @internal */
export function createTileSprite(
  local: LocalTileset<TmxTileset>,
  tile: TmxTileObject,
  tileIdx: number,
  size: Vec2,
  layer?: LayerId
): SpriteRender {
  const sprite = new SpriteRender(local.tileset.spritesheet, tileIdx, layer);

  sprite.scale.x = tile.shape.width / size.x;
  sprite.scale.y = tile.shape.height / size.y;

  sprite.flip(tile.flipX, tile.flipY);
  sprite.setAnchor(local.tileset.pivot.x, local.tileset.pivot.y);

  return sprite;
}

/** Composes entities from {@link TmxObject}. */
@Injectable()
export class TmxObjectComposer {

  /**
   * @param assets {@see AssetStorage}
   * @param physics {@see PhysicsFactory}
   */
  constructor(private readonly assets: AssetStorage, private readonly physics: TmxPhysicsFactory) {}

  /** Returns the size of the sprite matching `spriteId` in px. */
  public getSpriteSize(tileset: TmxTileset, spriteId: SpriteId): Vec2 {
    return this.assets.resolve(tileset.spritesheet).getSpriteSize(spriteId);
  }

  /**
   * Starts the composition of an entity using a TMX tile object.
   *
   * @param world Entity world
   * @param map Map asset on which the tile exists.
   * @param tile The tile from which the entity is composed.
   * @param layer Renderer layer where the tile sprite will be rendered.
   */
  public tile(world: World, map: TmxMapAsset, tile: TmxTileObject, layer?: LayerId): EntityBuilder {
    const local = map.tilesets.getFromGlobalId(tile.tileId);
    const tileIdx = local.getLocalIndex(tile.tileId);
    const size = this.getSpriteSize(local.tileset, tileIdx);

    const entity = world.create().use(
      createTileSprite(
        local,
        tile,
        tileIdx,
        size,
        layer
      )
    );

    const shapes = getTileShapes(local, tileIdx);

    if (shapes) {
      entity.use(this.physics.tile(size.x, size.y, shapes, local.tileset.pivot));
    }

    return entity;
  }

  /**
   * Starts the composition of an entity using a TMX object.
   *
   * @param world Entity world
   * @param map Map asset on which the object exists.
   * @param obj The object from which the entity is composed.
   * @param layer In case this object is a tile and a sprite is required for this object,
   *  this defines the renderer layer where it will be rendered.
   */
  public compose(world: World, map: TmxMapAsset, obj: TmxObject, layer?: LayerId): EntityBuilder {
    if (isTile(obj)) {
      return this.tile(world, map, obj, layer);
    }

    const entity = world.create();

    // Point geometry has a size of 0/0, if we don't ignore it there will be a bunch
    // of invisible colliders scattered around the world.
    if (! isPointGeometry(obj)) {
      entity.use(this.physics.shape(obj));
    }

    return entity;
  }


}
