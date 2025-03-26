import { AssetStorage } from '@heliks/tiles-assets';
import { Entity, EntityBuilder, Injectable, Rectangle, Vec2, World } from '@heliks/tiles-engine';
import { SpriteRender } from '@heliks/tiles-pixi';
import {
  isTile,
  TmxCustomTile,
  TmxGeometry,
  TmxGeometryObject,
  TmxMapAsset,
  TmxObject,
  TmxObjectLayer,
  TmxTileObject,
  TmxTileset
} from '../parser';
import { TmxObjectType } from './tmx-object-type';
import { TmxPhysicsFactory, TmxPhysicsOptions } from './tmx-physics-factory';
import { SpawnableAsset, SpawnLayerProperties } from './tmx-spawner';


/** @internal */
function isPointGeometry(geometry: TmxGeometry): boolean {
  return geometry.shape instanceof Rectangle
      && geometry.shape.width === 0
      && geometry.shape.height === 0;
}

/**
 * The default {@link TmxObjectType} for map objects used by the {@link TmxObjectSpawner}
 * if no custom default type was configured.
 */
@Injectable()
export class TmxObjectTypeDefault implements TmxObjectType {

  /**
   * @param assets {@see AssetStorage}
   * @param physics {@see PhysicsFactory}
   */
  constructor(private readonly assets: AssetStorage, private readonly physics: TmxPhysicsFactory) {}

  /** @internal */
  private getSpriteSize(tileset: TmxTileset, spriteIdx: number): Vec2 {
    return this.assets.resolve(tileset.spritesheet).getSpriteSize(spriteIdx);
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
  private composeTileObject(map: TmxMapAsset, layer: TmxObjectLayer<SpawnLayerProperties>, obj: TmxTileObject, entity: EntityBuilder): void {
    const local = map.tilesets.getFromGlobalId(obj.tileId);

    const tileIdx = local.getLocalIndex(obj.tileId);
    const tile = local.tileset.tile<TmxCustomTile<unknown, TmxPhysicsOptions>>(tileIdx);
    const scale = this.getScaleFactor(local.tileset, obj, tileIdx);
    const size = this.getSpriteSize(local.tileset, tileIdx);

    // If we have viable geometry, attach a rigid body to the tile.
    if (tile && tile.shapes && tile.shapes.length > 0) {
      entity.use(this.physics.tile(size.x, size.y, tile.shapes, local.tileset.pivot));
    }

    // Create the tile sprite.
    const sprite = new SpriteRender(local.tileset.spritesheet, tileIdx, layer.properties.$layer);

    sprite.scale.copy(scale);
    sprite.flip(obj.flipX, obj.flipY).setAnchor(
      local.tileset.pivot.x,
      local.tileset.pivot.y
    );

    entity.use(sprite);
  }

  /** @inheritDoc */
  public create(world: World, map: SpawnableAsset, layer: TmxObjectLayer<SpawnLayerProperties>, obj: TmxObject): Entity {
    const entity = world.create();

    if (isTile(obj)) {
      this.composeTileObject(map, layer, obj, entity);
    }
    else if (! isPointGeometry(obj)) {
      entity.use(this.physics.shape(obj as TmxGeometryObject<TmxPhysicsOptions>));
    }

    return entity.build();
  }

}
