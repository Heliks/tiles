import { Injectable, InjectStorage, ProcessingSystem, Query, QueryBuilder, Storage, World } from '@heliks/tiles-engine';
import { UiNode } from '../ui-node';


/** Updates all node {@link UiWidget widgets}. */
@Injectable()
export class UpdateWidgets extends ProcessingSystem {

  /**
   * @param nodes Storage for {@link UiNode} components.
   */
  constructor(@InjectStorage(UiNode) private nodes: Storage<UiNode>) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query.contains(UiNode).build();
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      const node = this.nodes.get(entity);

      if (node._widget) {
        node._widget.update(world, entity);

        // Widgets can project their content size directly onto the layout node,
        // overwriting the existing style.
        if (node._widget.size) {
          node.layout.style.size = node._widget.size;
        }
      }
    }
  }

}

