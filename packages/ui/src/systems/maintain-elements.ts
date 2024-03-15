import { Entity, Injectable, Query, QueryBuilder, ReactiveSystem, World } from '@heliks/tiles-engine';
import { ContextRef, Host } from '../context';
import { canDestroy, canInit, canSetupBeforeInit } from '../lifecycle';
import { Elements } from '../provider/elements';
import { UiElement } from '../ui-element';
import { UiNode } from '../ui-node';


/**
 * Assigns the appropriate context host to the element of `entity`. The host will
 * immediately share data with the elements' context.
 */
export function setupHostContext(world: World, entity: Entity): void {
  const host = Host.get(world, entity);
  
  if (host === undefined) {
    return;
  }

  const elements = world.storage(UiElement);
  const element = elements.get(entity);

  element.host = host;
  element.share(elements.get(host));
}

/** Initializes new {@link UiElement elements} and cleans up destroyed ones. */
@Injectable()
export class MaintainElements extends ReactiveSystem {

  public dirty = false;

  constructor(private readonly elements: Elements) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder
      .contains(UiNode)
      .contains(UiElement)
      .build();
  }

  /**
   * Emits the {@link OnBeforeInit} lifecycle on the given `element` and its attributes.
   *
   * @param world Entity world.
   * @param entity Owner of the {@link element} component.
   * @param element Component on which the lifecycle will be called.
   */
  public emitOnBeforeInit(world: World, entity: Entity, element: UiElement): void {
    // OnInit lifecycle for attributes.
    for (const item of element.attributes) {
      if (canSetupBeforeInit(item.attribute)) {
        item.attribute.onBeforeInit(world, entity);
      }
    }

    if (canSetupBeforeInit(element.instance)) {
      element.instance.onBeforeInit(world, entity);
    }
  }

  /**
   * Emits the {@link OnInit} lifecycle on the given `element` and its attributes.
   *
   * @param world Entity world.
   * @param entity Owner of the {@link element} component.
   * @param element Component on which the lifecycle will be called.
   */
  public emitOnInit(world: World, entity: Entity, element: UiElement): void {
    // OnInit lifecycle for attributes.
    for (const item of element.attributes) {
      if (canInit(item.attribute)) {
        item.attribute.onInit(world, entity);
      }
    }

    if (canInit(element.instance)) {
      element.instance.onInit(world, entity);
    }
  }

  /**
   * Emits the {@link OnDestroy} lifecycle on the given `element` and its attributes.
   *
   * @param world Entity world.
   * @param entity Owner of the {@link element} component.
   * @param element Component on which the lifecycle will be called.
   */
  public emitOnDestroy(world: World, entity: Entity, element: UiElement): void {
    // OnInit lifecycle for attributes.
    for (const item of element.attributes) {
      if (canDestroy(item.attribute)) {
        item.attribute.onDestroy(world, entity);
      }
    }

    if (canDestroy(element.instance)) {
      element.instance.onDestroy(world, entity);
    }
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const element = world.storage(UiElement).get(entity);
    const node = world.storage(UiNode).get(entity);

    this.emitOnBeforeInit(world, entity, element);

    if (element.instance.view) {
      // The node container might have other node containers as child already. To make
      // sure they are rendered on top of the elements own view, the view is always
      // inserted as the first child of the node container.
      node.container.addChildAt(element.instance.view, 0);
    }

    element.context = ContextRef.from(element.getContext());

    setupHostContext(world, entity);

    this.emitOnInit(world, entity, element);

    // Update the spawned element once.
    this.elements.update(world, entity);

    // Elements can spawn additional nodes & elements when they are updated (for example,
    // template elements and ui component renderers). This makes sure that the entities
    // of those newly spawned nodes are available instantly to subsequent systems such
    // as layout computation.
    world.queries.sync(world.changes);

    this.dirty = true;
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    const element = world.storage(UiElement).get(entity);
    const node = world.storage(UiNode).get(entity);

    // Remove element view from node container.
    if (element.instance.view) {
      node.container.removeChild(element.instance.view);
    }

    // Call destroy lifecycle.
    this.emitOnDestroy(world, entity, element);
  }

  update(world: World) {
    super.update(world)

    if (this.dirty) {
      this.dirty = false;
      this.update(world);
    }
  }

}
