import { AssetStorage } from '@heliks/tiles-assets';
import {
  Entity,
  Injectable,
  Query,
  QueryBuilder,
  ReactiveSystem,
  Screen,
  Transform,
  Vec2,
  World
} from '@heliks/tiles-engine';
import { Camera, Container, RendererSystem, Stage } from '@heliks/tiles-pixi';
import { Tilemap } from './tilemap';


/** @internal */
function render(tilemap: Tilemap): void {
  tilemap.view.removeChildren();

  for (let i = 0, l = tilemap.data.length; i < l; i++) {
    const gId = tilemap.data[i];

    if (gId === 0) {
      continue;
    }

    const pos = tilemap.grid.getPosition(i);
    const loc = tilemap.tilesets.getFromGlobalId(gId);

    const sprite = loc.tileset.sprite(
      loc.getLocalId(gId) - 1
    );

    // The y position needs to be adjusted for tiles that are larger than the tilemap
    // on which they are placed. Most map editors will anchor the tile at the bottom
    // left of the grid cell, so we do the same.
    sprite.x = pos.x;
    sprite.y = pos.y - (sprite.height - tilemap.grid.cellHeight);

    tilemap.view.addChild(sprite);
  }
}

/**
 * Renderer plugin that draws `Tilemap` components attached to entities.
 *
 * @see Tilemap
 */
@Injectable()
export class RenderTiles extends ReactiveSystem implements RendererSystem {

  /** Asset storage for tilemaps. */
  public readonly cache: AssetStorage<Tilemap> = new Map();

  /** Entities mapped to their PIXI.js display object. */
  private readonly containers = new Map<Entity, Container>();

  /**
   * @param camera {@link Camera}
   * @param stage {@link Stage}
   */
  constructor(private readonly camera: Camera, private readonly stage: Stage) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(Tilemap).contains(Transform).build();
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

    render(tilemap);

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

    for (const entity of this.query.entities) {
      const transform = world.storage(Transform).get(entity);
      const tilemap = world.storage(Tilemap).get(entity);

      if (tilemap.dirty) {
        render(tilemap);
      }

      tilemap.view.x = transform.world.x * this.camera.unitSize;
      tilemap.view.y = transform.world.y * this.camera.unitSize;
    }
  }

}
