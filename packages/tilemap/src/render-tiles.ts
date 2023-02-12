import { AssetLoader, AssetStorage } from '@heliks/tiles-assets';
import { Entity, Injectable, Query, QueryBuilder, ReactiveSystem, Transform, Vec2, World } from '@heliks/tiles-engine';
import { Camera, Container, RendererSystem, Sprite, SpriteSheet, Stage } from '@heliks/tiles-pixi';
import { Tilemap } from './tilemap';


/**
 * Renderer plugin that draws `Tilemap` components attached to entities.
 *
 * @see Tilemap
 */
@Injectable()
export class RenderTiles extends ReactiveSystem implements RendererSystem {

  /**
   * Entities mapped to their PIXI.js display object.
   *
   * @internal
   */
  private readonly containers = new Map<Entity, Container>();

  /**
   * @param assets {@link AssetStorage}
   * @param camera {@link Camera}
   * @param loader {@link AssetLoader}
   * @param stage {@link Stage}
   */
  constructor(
    private readonly assets: AssetStorage,
    private readonly camera: Camera,
    private readonly loader: AssetLoader,
    private readonly stage: Stage,
  ) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder
      .contains(Tilemap)
      .contains(Transform)
      .build();
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.boot(world);
  }

  /** @internal */
  private createTileSprite(tilemap: Tilemap, gId: number): Sprite {
    const local = tilemap.tilesets.getFromGlobalId(gId);

    return this
      .assets
      // Note: We lose the `Handle` generic here. This is a bug in typescript.
      .resolve<SpriteSheet>(local.tileset.spritesheet)
      .data
      .sprite(local.getLocalIndex(gId));
  }

  /** @internal */
  private render(tilemap: Tilemap): void {
    tilemap.view.removeChildren();

    for (let i = 0, l = tilemap.data.length; i < l; i++) {
      const gId = tilemap.data[i];

      if (gId === 0) {
        continue;
      }

      const tilePos = tilemap.grid.getPosition(i);
      const sprite = this.createTileSprite(tilemap, gId);

      // Adjust y-axis for tiles that are larger than the cell size of the tilemap on
      // which they are placed.
      sprite.x = tilePos.x;
      sprite.y = tilePos.y - (sprite.height - tilemap.grid.cellHeight);

      tilemap.view.addChild(sprite);
    }
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const tilemap = world.storage(Tilemap).get(entity);

    // Move tilemap anchor to center.
    tilemap.view
      .setPivot(0.5)
      .setFixedSize(new Vec2(
        tilemap.grid.width,
        tilemap.grid.height
      ));

    this.render(tilemap);

    this.stage.add(tilemap.view, tilemap.layer);
    this.containers.set(entity, tilemap.view);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    const container = this.containers.get(entity);

    if (container) {
      container.parent.removeChild(container);
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    super.update(world);

    for (const entity of this.query.entities) {
      const transform = world.storage(Transform).get(entity);
      const tilemap = world.storage(Tilemap).get(entity);

      if (tilemap.dirty) {
        this.render(tilemap);
      }

      tilemap.view.x = transform.world.x * this.camera.unitSize;
      tilemap.view.y = transform.world.y * this.camera.unitSize;
    }
  }

}
