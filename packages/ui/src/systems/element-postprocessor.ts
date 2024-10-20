import { Entity, Query, QueryBuilder, ReactiveSystem, World } from '@heliks/tiles-engine';
import { Element, Postprocess } from '../element';
import { UiElement } from '../ui-element';
import { UiNode } from '../ui-node';


/** @internal */
type HasPostprocess = Element & Postprocess;

/** @internal */
export function hasPostprocessor(world: World, entity: Entity): boolean {
  return Boolean((world.storage(UiElement).get(entity).instance as HasPostprocess).postprocess);
}

/** Executes the {@link Postprocess} hook on UI elements. */
export class ElementPostprocessor extends ReactiveSystem {

  // Note: Might want to change that to an array later. I'm currently not sure if element
  // order matters for postprocessing. Using a Set here seems convenient for now.
  private readonly entities = new Set<Entity>();

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query.contains(UiNode).contains(UiElement).build();
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    if (hasPostprocessor(world, entity)) {
      this.entities.add(entity);
    }
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    this.entities.delete(entity);
  }

  /** @inheritDoc */
  public update(world: World): void {
    super.update(world);

    const elements = world.storage(UiElement<{}, HasPostprocess>);
    const nodes = world.storage(UiNode);

    for (const entity of this.entities) {
      elements.get(entity).instance.postprocess(world, entity, nodes.get(entity).layout);
    }
  }

}
