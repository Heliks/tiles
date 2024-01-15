import { Entity, Injectable, Parent, Query, QueryBuilder, ReactiveSystem, World } from '@heliks/tiles-engine';
import { Context } from '../context';
import { getInputParams } from '../params';
import { UiNode } from '../ui-node';


/** @internal */
function getParentContext(world: World, entity: Entity): Entity | undefined {
  const parents = world.storage(Parent);
  const parent = parents.get(entity).entity;

  if (world.storage(Context).has(parent)) {
    return parent;
  }

  if (parents.has(entity)) {
    return getParentContext(world, parent);
  }
}

/** Maintains the hierarchy of {@link Context} components. */
@Injectable()
export class MaintainContexts extends ReactiveSystem {

  /** @internal */
  private readonly parents = new Map<Entity, Entity>();

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(UiNode).contains(Context).build();
  }

  /** @internal */
  private setParentContext(world: World, entity: Entity): void {
    const parent = getParentContext(world, entity);

    if (parent === undefined) {
      throw new Error(`Non top-level node "${entity}" has no parent context.`);
    }

    const contexts = world.storage(Context);

    // Add child to parent.
    contexts.get(parent).add(entity);
    contexts.get(entity).parent = parent;

    // Save this for later.
    this.parents.set(entity, parent);
  }

  /** Inserts the given `entity` in the context hierarchy. */
  public insert(world: World, entity: Entity) {
    const node = world.storage(UiNode).get(entity);

    if (! node._element) {
      throw new Error('Nodes with a context must be elements.');
    }

    // Assign element input keys.
    world
      .storage(Context)
      .get(entity)
      .input(
        ...getInputParams(
          node._element.getContextInstance()
        )
      );

    if (world.storage(Parent).has(entity)) {
      this.setParentContext(world, entity);
    }
  }

  /** Removes the given `entity` from the context hierarchy. */
  public remove(world: World, entity: Entity): void {
    const parent = this.parents.get(entity);

    if (parent !== undefined && world.alive(parent)) {
      world
        .storage(Context)
        .get(parent)
        .remove(entity);

      this.parents.delete(entity);
    }
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    this.insert(world, entity);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    this.remove(world, entity);
  }

}
