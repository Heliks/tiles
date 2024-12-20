import { Entity, Injectable, OnInit, Parent, Query, Storage, System, Vec2, World, XY } from '@heliks/tiles-engine';
import { Camera } from '@heliks/tiles-pixi';
import { DisplayContext } from '../style';
import { UiNode } from '../ui-node';


/**
 * Plugin for the PIXI.js renderer that draws {@link UiNode} components to the
 * renderer stage.
 */
@Injectable()
export class DrawUi implements OnInit, System {

  /** @internal */
  private nodes!: Storage<UiNode>;
  private parents!: Storage<Parent>;
  private query!: Query;
  private _scratch = new Vec2();

  constructor(
    private readonly camera: Camera
  ) {}

  /** @inheritDoc */
  public onInit(world: World): void {
    this.parents = world.storage(Parent);
    this.nodes = world.storage(UiNode);

    this.query = world
      .query()
      .contains(UiNode)
      .build();
  }

  /** @internal */
  private getViewPositionFromScreenPosition(screen: XY): Vec2 {
    // Todo: I don't know what I'm doing here but it works. Improve this when I have the time.
    const sx = (screen.x - (this.camera.screen.size.x >> 1));
    const sy = (screen.y - (this.camera.screen.size.y >> 1));

    this._scratch.x = (sx / this.camera.screen.scale.x) + (this.camera.world.x * this.camera.zoom * this.camera.unitSize);
    this._scratch.y = (sy / this.camera.screen.scale.y) + (this.camera.world.y * this.camera.zoom * this.camera.unitSize);

    return this._scratch;
  }

  /** @internal */
  private updateNodePosition(entity: Entity, node: UiNode): void {
    if (node.style.context === DisplayContext.World) {
      // Todo
      // node.container.x = node.layout.pos.x * this.camera.unitSize;
      // node.container.y = node.layout.pos.y * this.camera.unitSize;

      return;
    }

    if (this.parents.has(entity)) {
      node.container.x = node.layout.pos.x;
      node.container.y = node.layout.pos.y;
    }
    else {
      const position = this.getViewPositionFromScreenPosition(node.layout.pos);

      node.container.x = position.x;
      node.container.y = position.y;
    }

    // Adjust position for styled pivot.
    if (node.style.pivot) {
      node.container.x += node.container.width * node.style.pivot.x;
      node.container.y += node.container.height * node.style.pivot.y;
    }
  }

  /** @inheritDoc */
  public update(): void {
    for (const entity of this.query.entities) {
      this.updateNodePosition(entity, this.nodes.get(entity));
    }
  }

}

