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
import { Context, resolve } from '../context';
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
   * Updates all {@link Attribute attributes} on the given `context`.
   *
   * @param owner Node that owns the {@link context}.
   * @param context Context of which attributes are evaluated.
   * @param viewRef View reference from which the attribute resolves data. Usually this
   *  is the parent view reference type `P` of the contextual parent of {@link context}.
   */
  private updateAttributes<L, P>(owner: UiNode, context: Context<L, P>, viewRef: P): void {
    for (const item of context.attributes) {
      if (item.input) {
        item.attribute[item.input] = resolve(viewRef, item.key);
      }

      item.attribute.update(owner);
    }
  }

  /**
   * Updates the context tree of the given `entity`.
   *
   * @param world
   * @param entity
   */
  public updateTree(world: World, entity: Entity): void {
    const node = this.nodes.get(entity);

    // Safety: Only entities with elements are actually queried.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const viewRef = node._element!.getViewRef();
    const context = this.contexts.get(entity);

    for (const child of context.children) {
      const ctx = this.contexts.get(child);
      const node = this.nodes.get(child);

      // Safety: Only entities with elements are actually queried.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ctx.apply(node._element!.getViewRef(), viewRef);

      this.updateAttributes(node, ctx, viewRef);
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
