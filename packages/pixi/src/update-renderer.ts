import {
  Injectable,
  OnInit,
  ProcessingSystem,
  Query,
  QueryBuilder,
  RendererSystemDispatcher,
  Storage,
  World
} from '@heliks/tiles-engine';
import { RenderGroup } from './render-group';
import { Renderer } from './renderer';


/** System responsible for updating the renderer. */
@Injectable()
export class UpdateRenderer extends ProcessingSystem implements OnInit {

  /** @internal */
  private groups!: Storage<RenderGroup>;

  constructor(
    private readonly systems: RendererSystemDispatcher,
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
    this.systems.update(world);

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
