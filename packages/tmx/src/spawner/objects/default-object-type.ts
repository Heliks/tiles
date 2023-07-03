import { AssetStorage } from '@heliks/tiles-assets';
import { EntityBuilder, Injectable, Transform, Vec2, World } from '@heliks/tiles-engine';
import { SpriteRender } from '@heliks/tiles-pixi';
import { isTile, TmxMapAsset, TmxObject, TmxObjectLayer, TmxTileObject, TmxTileset } from '../../parser';
import { TmxPhysicsFactory } from '../tmx-physics-factory';
import { TmxSpawnerConfig } from '../tmx-spawner-config';
import { TmxObjectType } from './tmx-object-types';


/**
 * Default strategy used to compose entities from {@link TmxObject objects}.
 *
 * @see TmxObjectType
 */
@Injectable()
export class DefaultObjectType implements TmxObjectType {

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
  private composeTileObject(map: TmxMapAsset, layer: TmxObjectLayer, obj: TmxTileObject, entity: EntityBuilder): void {
    const local = map.tilesets.getFromGlobalId(obj.tileId);

    const tileIdx = local.getLocalIndex(obj.tileId);
    const tile = local.tileset.tile(tileIdx);
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
  public compose(world: World, entity: EntityBuilder, map: TmxMapAsset, layer: TmxObjectLayer, obj: TmxObject): void {
    let x = obj.shape.x;
    let y = obj.shape.y;

    if (isTile(obj)) {
      this.composeTileObject(map, layer, obj, entity);
    }
    else {
      // If the object is just free floating geometry, treat the object geometry as
      // the rigid body itself.
      entity.use(this.physics.shape(obj));
    }

    // The object position we received from tiled is relative to the top left corner
    // of the map. Re-align position to world space & apply unit size.
    x = (x / this.config.unitSize) - (map.grid.cols / 2);
    y = (y / this.config.unitSize) - (map.grid.rows / 2);

    entity.use(new Transform(0, 0, 0, x, y));
  }


}