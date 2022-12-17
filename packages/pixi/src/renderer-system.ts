import { Injectable, OnInit, ProcessingSystem, Query, QueryBuilder, Storage, World } from '@heliks/tiles-engine';
import { RenderGroup } from './render-group';
import { Renderer } from './renderer';
import { RendererPlugins } from './renderer-plugins';


/** System responsible for updating the renderer. */
@Injectable()
export class RendererSystem extends ProcessingSystem implements OnInit {

  /** @internal */
  private groups!: Storage<RenderGroup>;

  constructor(
    private readonly plugins: RendererPlugins,
    private readonly renderer: Renderer
  ) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(RenderGroup).build();
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.groups = world.storage(RenderGroup);
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const plugin of this.plugins.items) {
      plugin.update(world);
    }

    for (const entity of this.query.entities) {
      const group = this.groups.get(entity);

      if (group.sorter) {
        group.container.children.sort(group.sorter);
      }
    }

    // Renders everything to the view.
    this.renderer.update();
    this.renderer.debugDraw.clear();
  }

}
