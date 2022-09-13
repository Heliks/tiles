import { AssetStorage } from '@heliks/tiles-assets';
import { contains, Entity, Injectable, ReactiveSystem, Transform, Vec2, World } from '@heliks/tiles-engine';
import { Container, RendererPlugin, Screen, Stage } from '@heliks/tiles-pixi';
import { Tilemap } from './tilemap';


/**
 * Plugin for the PIXI.JS renderer that draws tile maps.
 */
@Injectable()
export class RenderTiles extends ReactiveSystem implements RendererPlugin {

  /** Asset storage for tilemaps. */
  public readonly cache: AssetStorage<Tilemap> = new Map();

  /** Entities mapped to their PIXI.js display object. */
  private readonly containers = new Map<Entity, Container>();

  /**
   * @param screen
   * @param stage
   */
  constructor(private readonly screen: Screen, private readonly stage: Stage) {
    super(contains(Tilemap, Transform));
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.boot(world);
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

    for (let i = 0, l = tilemap.data.length; i < l; i++) {
      const gId = tilemap.data[i];

      if (gId === 0) {
        continue;
      }

      const pos = tilemap.grid.position(i);

      const tileset = tilemap.tileset(gId);
      const sprite = tileset.sprite(gId);

      // Y position needs to be adjusted for tiles that are larger than the tile grid. In
      // that case, most editors will anchor the tile bottom-left, so we do the same.
      sprite.x = pos.x;
      sprite.y = pos.y - (tileset.tileHeight - tilemap.grid.cellHeight);

      tilemap.view.addChild(sprite);
    }

    this.stage.insert(tilemap.view, tilemap.group);
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

    for (const entity of this.group.entities) {
      const transform = world.storage(Transform).get(entity);
      const tilemap = world.storage(Tilemap).get(entity);

      tilemap.view.x = transform.world.x * this.screen.unitSize;
      tilemap.view.y = transform.world.y * this.screen.unitSize;
    }
  }

}
