import { Entity, Injectable, OnInit, Parent, Query, Storage, System, Vec2, World, XY } from '@heliks/tiles-engine';
import { Camera } from '@heliks/tiles-pixi';
import { UiAlign, UiNode } from './ui-node';


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
    // console.log('SCREEN', screen.x, screen.y)

    return this.camera.screenToWorld(screen.x, screen.y, this._scratch).scale(this.camera.unitSize);
  }

  /** @internal */
  private updateNodePosition(entity: Entity, node: UiNode): void {
    // Set PIXI pivot based on node pivot.
    node.pivot.getPosition(
      node.container.width,
      node.container.height,
      node.container.pivot
    );

    if (node.align === UiAlign.World) {
      // node.container.x = node.layout.pos.x * this.camera.unitSize;
      // node.container.y = node.layout.pos.y * this.camera.unitSize;

      return;
    }

    if (this.parents.has(entity)) {
      const f = this.camera as any;

      // Todo
      node.container.x = node.layout.pos.x;
      node.container.y = node.layout.pos.y;
    }
    else {
      const position = this.getViewPositionFromScreenPosition(node.layout.pos);

      node.container.x = position.x;
      node.container.y = position.y;
    }

  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      const node = this.nodes.get(entity);

      if (node._widget) {
        node._widget.update(world, entity);

        // Ui nodes with a widget can project their content size directly onto the layout
        // node, overwriting the existing style.
        if (node._widget?.size) {
          node.layout.style.size = node._widget.size;
        }
      }

      this.updateNodePosition(entity, node);
    }
  }

}

