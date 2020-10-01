import { contains, Injectable, ReactiveSystem, World } from '@heliks/tiles-engine';
import { AssetLoader, AssetStorage } from '@heliks/tiles-assets';
import { Tilemap } from './tilemap';
import { Container, Stage } from '@heliks/tiles-pixi';
import { Entity } from '@heliks/ecs';

@Injectable()
export class TilemapRenderer extends ReactiveSystem {

  /** Asset storage for tilemaps. */
  public readonly cache: AssetStorage<Tilemap> = new Map();

  constructor(
    protected readonly loader: AssetLoader,
    protected readonly stage: Stage

  ) {
    super(contains(Tilemap));
  }

  public onEntityAdded(world: World, entity: Entity): void {
    const tilemap = world.storage(Tilemap).get(entity);
    const container = new Container();

    container.setPivot(0.5);

    for (let i = 0, l = tilemap.data.length; i < l; i++) {
      const gId = tilemap.data[i];

      if (gId === 0) {
        continue;
      }

      const pos = tilemap.grid.pos(i);
      const sprite = tilemap.tileset(gId).sprite(gId);

      sprite.x = pos[0];
      sprite.y = pos[1];

      container.addChild(sprite);
    }

    this.stage.add(container, tilemap.node);

    // container.setPivot(0.5);

    container.x = 0;
    container.y = 0;
  }

  public onEntityRemoved(world: World, entity: Entity): void {

  }

}
