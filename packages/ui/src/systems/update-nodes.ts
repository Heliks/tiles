import { Injectable, InjectStorage, ProcessingSystem, Query, QueryBuilder, Storage } from '@heliks/tiles-engine';
import { Display } from '../layout';
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

      // Hide PIXI container if node is display:none
      node.container.visible = node.style.display !== Display.None;
    }
  }

}

