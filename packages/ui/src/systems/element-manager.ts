import { Entity, Injectable, Query, QueryBuilder, ReactiveSystem, Storage, World } from '@heliks/tiles-engine';
import { ContextRef, Host } from '../context';
import { canDestroy, canInit, canSetupBeforeInit } from '../lifecycle';
import { Document, EventLifecycle } from '../providers';
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

/** Manages {@link UiElement} components that are attached to {@link UiNode nodes}.*/
@Injectable()
export class ElementManager extends ReactiveSystem {

  /** @internal */
  private readonly entities: Entity[] = [];

  /**
   * @param document
   * @param eventLifecycle
   */
  constructor(private readonly document: Document, private readonly eventLifecycle: EventLifecycle) {
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

  private updateAttributes(node: UiNode, element: UiElement, context: ContextRef): void {
    for (const item of element.attributes) {
      item.resolve(context);
      item.attribute.update(node);
    }
  }

  public updateEntity(world: World, elements: Storage<UiElement>, nodes: Storage<UiNode>, entity: Entity): void {
    const element = elements.get(entity);
    const node = nodes.get(entity);

    // Note: Data is shared with the context host and attributes are evaluated even if
    // the node is invisible, because when an attribute receives a new input, it could
    // possibly make the element visible again.
    if (element.host !== undefined) {
      const host = elements.get(element.host);

      this.updateAttributes(node, element, host.context);

      element.share(host);
    }

    if (node.hidden()) {
      return;
    }

    this.eventLifecycle.trigger(world, node, element.instance);

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

    element.context = ContextRef.from(element.getContext());

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

    // Call destroy lifecycle.
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

    // If new elements were spawned during this pass, run the system again. This makes
    // sure that new elements are fully processed on the same frame as they are spawned,
    // preventing a short flickering as they appear. As this re-synchronizes entity
    // queries, the new elements are also available to be processed by subsequent
    // systems, like the layout update.
    if (this.document.invalid) {
      // Trigger world update to re-synchronize the systems entity query with changes above.
      world.update();

      this.document.invalid = false;
      this.update(world);
    }
  }

}
