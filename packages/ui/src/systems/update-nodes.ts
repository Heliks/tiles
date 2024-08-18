import { Display } from '@heliks/flex';
import { Injectable, InjectStorage, ProcessingSystem, Query, QueryBuilder, Storage } from '@heliks/tiles-engine';
import { UiNode } from '../ui-node';


/** Updates {@link Element elements} on active {@link UiNode nodes}. */
@Injectable()
export class UpdateNodes extends ProcessingSystem {

  /**
   * @param nodes Storage for {@link UiNode} components.
   */
  constructor(@InjectStorage(UiNode) private readonly nodes: Storage<UiNode>) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query.contains(UiNode).build();
  }

  /** @inheritDoc */
  public update(): void {
    for (const entity of this.query.entities) {
      const node = this.nodes.get(entity);

      node.container.alpha = node.style.opacity ?? 1;
      node.container.rotation = node.style.rotation ?? 0;
      node.container.visible = node.style.display !== Display.None;

      if (node.style.pivot) {
        node.container.pivot.x = node.container.width * node.style.pivot.x;
        node.container.pivot.y = node.container.height * node.style.pivot.y;
      }
    }
  }

}

