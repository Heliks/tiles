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
export class UpdateLayouts extends ProcessingSystem {

  /** Available screen space. */
  private space = new Rect(0, 0);

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
    this.space.set(this.screen.resolution.x, this.screen.resolution.y);

    for (const entity of this.query.entities) {
      compute(this.nodes.get(entity).layout, this.space);
    }
  }

}
