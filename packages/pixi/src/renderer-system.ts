import { contains, Entity, Inject, Injectable, ReactiveSystem, token, World } from '@heliks/tiles-engine';
import { Renderer } from './renderer';
import { Stage } from './stage';
import { RenderNode } from "./renderer-node";

/** @internal */
interface SortableRectangle {
  x: number;
  y: number;
  height: number;
  width: number;
}

/**
 * Depth sorts the given array of `rectangles`. E.g. Rectangles with a higher bottom-
 * center aligned position will come first.
 */
function sort(rectangles: SortableRectangle[]): void {
  rectangles.sort((a, b) => (a.y + (a.height / 2)) - (b.y + (b.height / 2)));
}

/** Token where renderer plugins should be provided. */
export const RENDERER_PLUGINS_TOKEN = token<RendererPlugin[]>();

/** Plugin that can be added to the renderer. */
export interface RendererPlugin {

  /** Called once on each frame before the scene is drawn. */
  update(world: World): void;

}

/** Rendering system responsible for executing the renderer graph. */
@Injectable()
export class RendererSystem extends ReactiveSystem {

  constructor(
    @Inject(RENDERER_PLUGINS_TOKEN)
    private readonly plugins: RendererPlugin[],
    private readonly renderer: Renderer,
    private readonly stage: Stage
  ) {
    super(contains(RenderNode));
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    this.stage.add(world.storage(RenderNode).get(entity)._container);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    this.stage.remove(world.storage(RenderNode).get(entity)._container);
  }

  /** @inheritDoc */
  public update(world: World): void {
    super.update(world);

    const nodes = world.storage(RenderNode);

    for (const entity of this.group.entities) {
      const node = nodes.get(entity);

      // Depth sort children of this node if the appropriate flag is set.
      if (node.sortable) {
        sort(node._container.children);
      }
    }

    for (const plugin of this.plugins) {
      plugin.update(world);
    }

    // Renders everything to the view.
    this.renderer.update();

    // Clear all debug information immediately after drawing so that the next frame
    // can draw new ones.
    this.renderer.debugDraw.clear();
  }

}
