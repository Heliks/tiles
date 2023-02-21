import { TmxTileset } from '../tmx-tileset';
import { GameObject, isTile, Tile } from '../tmx-game-object';
import { TmxTilemap } from '../tmx-tilemap';
import { Layer, ObjectLayer, TileLayer, TmxLayerType } from '../layers';
import { Entity, EntityBuilder, Injectable, Parent, Transform, Vec2, World } from '@heliks/tiles-engine';
import { Align, LayerId, SpriteRender } from '@heliks/tiles-pixi';
import { AssetStorage } from '@heliks/tiles-assets';
import { TmxConfig } from '../tmx-config';
import { Tilemap } from '@heliks/tiles-tilemap';

/** @internal */
function setAnchor(sprite: SpriteRender, align: Align): void {
  switch (align) {
    case Align.Center: sprite.setAnchor(0.5, 0.5); break;
    case Align.Left: sprite.setAnchor(0, 0.5); break;
    case Align.Right: sprite.setAnchor(1, 0.5); break;
    case Align.Top: sprite.setAnchor(0.5, 0); break;
    case Align.TopLeft: sprite.setAnchor(0, 0); break;
    case Align.TopRight: sprite.setAnchor(1, 0); break;
    case Align.Bottom: sprite.setAnchor(0.5, 1); break;
    case Align.BottomLeft: sprite.setAnchor(0, 1); break;
    case Align.BottomRight: sprite.setAnchor(1, 1); break;
  }
}

/** @internal */
function spawnTileLayer(world: World, map: TmxTilemap, layer: TileLayer, renderLayer?: LayerId): Entity {
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

/** Service that spawns {@link TmxTilemap maps}. */
@Injectable()
export class MapSpawner {

  /**
   * @param assets {@see AssetStorage}
   * @param config {@see TmxConfig}
   */
  constructor(
    private readonly assets: AssetStorage,
    private readonly config: TmxConfig
  ) {}

  /** @internal */
  private getSpriteSize(tileset: TmxTileset, spriteIdx: number): Vec2 {
    return this.assets.resolve(tileset.spritesheet).data.getSpriteSize(spriteIdx);
  }

  /** @internal */
  private getScaleFactor(tileset: TmxTileset, tile: Tile, spriteIdx: number): Vec2 {
    const size = this.getSpriteSize(tileset, spriteIdx);

    size.x = tile.data.width / size.x;
    size.y = tile.data.height / size.y;

    return size;
  }

  /** @internal */
  private createObjectSprite(tileset: TmxTileset, tile: Tile, spriteId: number, renderLayer?: LayerId): SpriteRender {
    const sprite = new SpriteRender(tileset.spritesheet, spriteId, renderLayer);

    sprite.scale.copy(this.getScaleFactor(tileset, tile, spriteId));
    sprite.flip(tile.flipX, tile.flipY);

    // The origin position of objects is at their bottom center.
    setAnchor(sprite, tileset.align);

    return sprite;
  }

  /** @internal */
  private createObjectBuilder(world: World, map: TmxTilemap, obj: GameObject, renderLayer?: LayerId): EntityBuilder {
    const transform = new Transform(
      0,
      0,
      0,
      (obj.data.x / this.config.unitSize) - (map.grid.cols / 2),
      (obj.data.y / this.config.unitSize) - (map.grid.rows / 2)
    );

    const entity = world
      .builder()
      .use(transform);

    if (isTile(obj)) {
      const tileset = map.tilesets.getFromGlobalId(obj.tileId);
      const tileId  = tileset.getLocalId(obj.tileId);

      entity.use(
        this.createObjectSprite(
          tileset.tileset,
          obj, tileId - 1,
          renderLayer
        )
      );
    }

    return entity;
  }

  /** @internal */
  private spawnObjectLayer(world: World, map: TmxTilemap, layer: ObjectLayer, renderLayer?: LayerId): Entity {
    const parent = world.create(new Transform(10, 10));

    for (const obj of layer.data) {
      this.createObjectBuilder(world, map, obj, renderLayer).use(new Parent(parent)).build();
    }

    return parent;
  }

  /** @internal */
  private spawnLayer(world: World, map: TmxTilemap, layer: Layer, renderLayer?: LayerId): Entity {
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
   * Spawns a {@link TmxTilemap map}.
   *
   * If a `parent` entity is given, entities that are created in the process will be
   * children of that parent.
   */
  public spawn(world: World, map: TmxTilemap, parent?: Entity): void {
    let renderLayer;

    for (const data of map.layers) {
      if (data.properties.$layer) {
        renderLayer = data.properties.$layer;
      }

      const entity = this.spawnLayer(world, map, data, renderLayer);

      if (parent) {
        world.add(entity, new Parent(parent));
      }
    }
  }

}