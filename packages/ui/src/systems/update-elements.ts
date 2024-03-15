import { Injectable, ProcessingSystem, Query, QueryBuilder, Subscriber, World } from '@heliks/tiles-engine';
import { Elements } from '../provider/elements';
import { UiElement } from '../ui-element';
import { UiEvent } from '../ui-event';
import { UiNode } from '../ui-node';


/**
 * Updates elements.
 */
@Injectable()
export class UpdateElements extends ProcessingSystem {

  /** Contains active subscriptions for nodes that are interactive. */
  private subscriptions = new Map<UiNode, Subscriber<UiEvent>>();

  constructor(private readonly elements: Elements) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query
      .contains(UiNode)
      .contains(UiElement)
      .build();
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      this.elements.update(world, entity);
    }
  }

}

