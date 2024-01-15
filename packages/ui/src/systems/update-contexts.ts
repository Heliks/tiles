import {
  Entity,
  Injectable,
  InjectStorage,
  Parent,
  ProcessingSystem,
  Query,
  QueryBuilder,
  Storage,
  World
} from '@heliks/tiles-engine';
import { Context } from '../context';
import { UiNode } from '../ui-node';


/** Updates the {@link Context} hierarchy. */
@Injectable()
export class UpdateContexts extends ProcessingSystem {

  /**
   * @param contexts Storage for {@link Context} components.
   * @param nodes Storage for {@link UiNode} components.
   */
  constructor(
    @InjectStorage(Context)
    public readonly contexts: Storage<Context>,
    @InjectStorage(UiNode)
    public readonly nodes: Storage<UiNode>
  ) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder
      .contains(UiNode)
      .contains(Context)
      .excludes(Parent)
      .build();
  }

  /**
   * Updates the context tree of the given `entity`.
   *
   * @param world
   * @param entity
   */
  public updateTree(world: World, entity: Entity): void {
    // Safety: Only entities with elements are actually queried.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const element = this.nodes.get(entity)._element!.getContextInstance();
    const context = this.contexts.get(entity);


    for (const child of context.children) {
      const ctx = this.contexts.get(child);
      const node = this.nodes.get(child);

      // Resolve context data from element & apply it to its own element.
      ctx.resolve(element);

      // Safety: Only entities with elements are actually queried.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ctx.apply(node._element!.getContextInstance());

      this.updateTree(world, child);
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      this.updateTree(world, entity);
    }
  }

}
