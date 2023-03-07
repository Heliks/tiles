import { UiNode } from '../ui-node';
import { Injectable, OnInit, ProcessingSystem, Query, QueryBuilder, Storage, World } from '@heliks/tiles-engine';
import { Style } from './style';
import { FlexCompositor } from './flex-compositor';


@Injectable()
export class ApplyStyles extends ProcessingSystem implements OnInit {

  /**
   * Storage for {@link Style} components.
   *
   * @internal
   */
  private columns!: Storage<Style>;

  /**
   * Storage for {@link UiNode} components.
   *
   * @internal
   */
  private roots!: Storage<UiNode>;

  /**
   * @param compositor {@see FlexboxCompositor}
   */
  constructor(private readonly compositor: FlexCompositor) {
    super();
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.columns = world.storage(Style);
    this.roots = world.storage(UiNode);
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query
      .contains(UiNode)
      .contains(Style)
      .build();
  }

  /** @inheritDoc */
  public update(): void {
    for (const entity of this.query.entities) {
      this.compositor.apply(entity, this.columns.get(entity));
    }
  }

}
