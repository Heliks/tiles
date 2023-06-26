import {
  Entity,
  Injectable,
  InjectStorage,
  Parent,
  Query,
  QueryBuilder,
  ReactiveSystem,
  Storage,
  World
} from '@heliks/tiles-engine';
import { Node } from '../layout';
import { UiNode } from '../ui-node';


/** Maintains the hierarchy between {@link Node layout nodes}. */
@Injectable()
export class MaintainLayouts extends ReactiveSystem {

  /**
   * @param parents Storage for {@link Parent} components.
   * @param uiNodes Storage for {@link UiNode} components.
   */
  constructor(
    @InjectStorage(Parent)
    private parents: Storage<Parent>,
    @InjectStorage(UiNode)
    private uiNodes: Storage<UiNode>
  ) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query.contains(UiNode).build();
  }

  /** @internal */
  private getParentNode(entity: Entity): Node | undefined {
    if (this.parents.has(entity)) {
      const parent = this.parents.get(entity).entity;

      if (this.uiNodes.has(parent)) {
        return this.uiNodes.get(parent).layout;
      }
    }
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    this.getParentNode(entity)?.add(this.uiNodes.get(entity).layout);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    this.getParentNode(entity)?.remove(this.uiNodes.get(entity).layout);
  }

}

