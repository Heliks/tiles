import { Entity, Injectable, Query, QueryBuilder, ReactiveSystem, Storage, World } from '@heliks/tiles-engine';
import { ContextRef, Host } from '../context';
import { canDestroy, canInit, canListenToChanges, canSetupBeforeInit } from '../lifecycle';
import { Document, EventLifecycle } from '../providers';
import { UiElement } from '../ui-element';
import { UiNode } from '../ui-node';
import { MaintainLayouts } from './maintain-layouts';


/**
 * Assigns the appropriate context host to the element of `entity`, if any. The elements
 * bindings will be resolved afterward, regardless if a host was assigned or not.
 */
export function setupHostContext(world: World, entity: Entity): void {
  const elements = world.storage(UiElement);
  const element = elements.get(entity);

  element.host = Host.get(world, entity);

  let ref;

  if (element.host !== undefined) {
    ref = elements.get(element.host).context;
  }

  element.resolve(ref);
}

/** Manages {@link UiElement} components that are attached to {@link UiNode nodes}.*/
@Injectable()
export class ElementManager extends ReactiveSystem {

  /** @internal */
  private readonly entities: Entity[] = [];

  /**
   * @param document
   * @param eventLifecycle
   * @param layouts MaintainLayouts
   */
  constructor(
    private readonly document: Document,
    private readonly eventLifecycle: EventLifecycle,
    private readonly layouts: MaintainLayouts
  ) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder
      .contains(UiNode)
      .contains(UiElement)
      .build();
  }

  /** @internal */
  public emitOnBeforeInit(world: World, entity: Entity, element: UiElement): void {
    if (canSetupBeforeInit(element.instance)) {
      element.instance.onBeforeInit(world, entity);
    }
  }

  /** @internal */
  public emitOnInit(world: World, entity: Entity, element: UiElement): void {
    if (canInit(element.instance)) {
      element.instance.onInit(world, entity);
    }
  }

  /** @internal */
  public emitOnDestroy(world: World, entity: Entity, element: UiElement): void {
    if (canDestroy(element.instance)) {
      element.instance.onDestroy(world, entity);
    }
  }

  /**
   * Triggers the {@link OnChanges} lifecycle if the given elements changes are tracked
   * and there are unprocessed input changes.
   */
  public updateChanges(world: World, entity: Entity, element: UiElement): void {
    if (element.context.track && element.context.changed) {
      element.context.changed = false;

      if (canListenToChanges(element.context.view)) {
        element.context.view.onChanges(world, entity, element.context.changes);

        // Reset consumed changes.
        element.context.changes = {}
      }
    }
  }

  public updateEntity(world: World, elements: Storage<UiElement>, nodes: Storage<UiNode>, entity: Entity): void {
    const element = elements.get(entity);
    const node = nodes.get(entity);

    this.updateChanges(world, entity, element);

    let host;

    if (element.host !== undefined) {
      host = elements.get(element.host).context;
    }

    element.resolve(host);

    if (node.hidden()) {
      return;
    }

    this.eventLifecycle.trigger(world, entity, node, element.instance);

    element.instance.update(world, entity, node.layout);

    // Elements can project their content size directly into the stylesheet.
    if (element.instance.size) {
      node.layout.style.size = element.instance.size;
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

    if (! element.context) {
      element.context = ContextRef.from(element.getContext());
    }

    element.context.track = canListenToChanges(element.context.view);

    setupHostContext(world, entity);

    this.emitOnInit(world, entity, element);

    // Update the spawned element once.
    // this.elements.update(world, entity);
    this.document.invalidate();
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    const element = world.storage(UiElement).get(entity);
    const node = world.storage(UiNode).get(entity);

    // Remove element view from node container.
    if (element.instance.view) {
      node.container.removeChild(element.instance.view);
    }

    this.eventLifecycle.unsubscribe(node);
    this.emitOnDestroy(world, entity, element);
  }

  /** @inheritDoc */
  public update(world: World): void {
    this.entities.length = 0;
    this.entities.push(...this.query.entities);

    // Triggers onEntityAdded() and onEntityRemoved() events. Some elements like template
    // elements or ui component renderers might spawn new elements during this time.
    super.update(world);

    const nodes = world.storage(UiNode);
    const elems = world.storage(UiElement);

    // Update all elements, excluding those that were either newly spawned or destroyed
    // in the the super.update() call above.
    for (const entity of this.entities) {
      if (world.alive(entity)) {
        this.updateEntity(world, elems, nodes, entity);
      }
    }

    // If the document was invalidated by creating or destroying elements during this
    // pass, we'll run the system again. This ensures that new elements are fully
    // processed on the same frame as they are spawned, which prevents flickering and
    // other frame related issues.
    if (this.document.invalid) {
      world.update();
     
      this.layouts.update(world);
      
      this.document.invalid = false;
      this.update(world);
    }
  }

}
