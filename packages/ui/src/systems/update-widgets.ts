import {
  Entity,
  Hierarchy,
  Injectable,
  InjectStorage,
  Parent,
  ProcessingSystem,
  Query,
  QueryBuilder,
  Storage,
  World
} from '@heliks/tiles-engine';
import { UiNode } from '../ui-node';


/**
 * Updates all node {@link UiWidget widgets}.
 *
 * Updates happens top-down in a nodes entity {@link Hierarchy}, which means that
 * parent nodes are always updated before their children.
 */
@Injectable()
export class UpdateWidgets extends ProcessingSystem {

  /**
   * @param nodes Storage for {@link UiNode} components.
   * @param hierarchy Entity hierarchy.
   */
  constructor(
    @InjectStorage(UiNode)
    private readonly nodes: Storage<UiNode>,
    private readonly hierarchy: Hierarchy
  ) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query
      .contains(UiNode)
      .excludes(Parent)
      .build();
  }

  public updateNode(world: World, entity: Entity): void {
    const node = this.nodes.get(entity);

    if (node._widget) {
      node._widget.update(world, entity, node.layout);

      // Widgets can project their content size directly onto the layout node,
      // overwriting the existing style.
      if (node._widget.size) {
        node.layout.style.size = node._widget.size;
      }
    }

    const children = this.hierarchy.children.get(entity);

    if (children) {
      for (const child of children) {
        this.updateNode(world, child);
      }
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      this.updateNode(world, entity);
    }
  }

}

