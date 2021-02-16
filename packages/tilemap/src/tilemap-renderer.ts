import { contains, Injectable, ReactiveSystem, Transform, World } from '@heliks/tiles-engine';
import { AssetLoader, AssetStorage } from '@heliks/tiles-assets';
import { Tilemap } from './tilemap';
import { Container, RenderNode, ScreenDimensions, Stage } from '@heliks/tiles-pixi';
import { Entity } from '@heliks/ecs';
import { vec2 } from '@heliks/tiles-math';

@Injectable()
export class TilemapRenderer extends ReactiveSystem {

  /** Asset storage for tilemaps. */
  public readonly cache: AssetStorage<Tilemap> = new Map();

  /** @internal */
  private readonly containers = new Map<Entity, Container>();

  constructor(
    protected readonly loader: AssetLoader,
    protected readonly stage: Stage

  ) {
    super(contains(Tilemap, Transform));
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const tilemap = world.storage(Tilemap).get(entity);
    const container = new Container();

    // Set the fixed size of the container to the size of the chunk and make sure it
    // is anchored to it's center and not the top-left corner.
    container.setPivot(0.5).setFixedSize(vec2(
      tilemap.grid.width,
      tilemap.grid.height
    ));

    for (let i = 0, l = tilemap.data.length; i < l; i++) {
      const gId = tilemap.data[i];

      if (gId === 0) {
        continue;
      }

      const pos = tilemap.grid.pos(i);
      const sprite = tilemap.tileset(gId).sprite(gId);

      sprite.x = pos.x;
      sprite.y = pos.y;

      container.addChild(sprite);
    }

    if (tilemap.parent !== undefined) {
      world.storage(RenderNode).get(tilemap.parent).add(container);
    }
    else {
      this.stage.add(container);
    }

    this.containers.set(entity, container);
  }

  /** @inheritDoc */
  public onEntityRemoved(): void {
    // Todo

    return;
  }

  /** @inheritDoc */
  public update(world: World): void {
    const us = world.get(ScreenDimensions).unitSize;

    super.update(world);

    for (const entity of this.group.entities) {
      const transform = world.storage(Transform).get(entity);
      const container = this.containers.get(entity);

      if (container) {
        container.x = transform.world.x * us;
        container.y = transform.world.y * us;
      }
    }
  }

}
