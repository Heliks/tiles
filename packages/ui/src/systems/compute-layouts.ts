import {
  Injectable,
  InjectStorage,
  Parent,
  ProcessingSystem,
  Query,
  QueryBuilder,
  Screen,
  Storage
} from '@heliks/tiles-engine';
import { compute, Rect } from '../layout';
import { UiNode } from '../ui-node';


/** Computes UI node {@link UiNode.layout layouts}. */
@Injectable()
export class ComputeLayouts extends ProcessingSystem {

  constructor(
    @InjectStorage(UiNode)
    private readonly nodes: Storage<UiNode>,
    private readonly screen: Screen
  ) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    // We are only interested in top-level nodes because layout computation is recursive,
    // therefore, children don't need to be computed separately.
    return query
      .contains(UiNode)
      .excludes(Parent)
      .build();
  }

  /** @inheritDoc */
  public update(): void {
    for (const entity of this.query.entities) {
      const node = this.nodes.get(entity);

      compute(node.layout, new Rect(
        this.screen.resolution.x,
        this.screen.resolution.y
      ));
    }
  }

}