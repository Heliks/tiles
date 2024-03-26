import { Entity, Hierarchy, Parent, Type, World } from '@heliks/tiles-engine';
import { canDestroy, canInit, Element, Host, OnBeforeInit, OnDestroy, OnInit, UiNode } from '@heliks/tiles-ui';
import { UiComponent } from './ui-component';


/**
 * A {@link UiElement} that renders a {@link UiComponent} on the entity to which this
 * component is attached to.
 *
 * The node tree that is created during the rendering of the {@link UiComponent}, will
 * always be a child of the owner of this component. When the owner is destroyed, the UI
 * component will be destroyed as well.
 *
 * - `T`: The UI Component type that is rendered by this element.
 */
export class JsxRenderer<T extends UiComponent = UiComponent> implements Element<T>, OnInit, OnBeforeInit, OnDestroy {

  /**
   * The instance of the UI {@link component} that will be created after the owner of
   * this element was spawned into the world. When the owner is destroyed, the instance
   * will be destroyed as well.
   */
  public instance!: T;

  /**
   * Contains the root entity of the {@link UiNode} tree that is being rendered by
   * this UI component.
   */
  public root!: Entity;

  /**
   * @param component UI Component type that should be rendered by this element. Will be
   *  instantiated using the service container after the {@link UiNode} of this element
   *  is attached to an entity.
   */
  constructor(public readonly component: Type<T>) {}

  /** @inheritDoc */
  public getContext(): T {
    return this.instance;
  }

  /** @inheritDoc */
  public onBeforeInit(world: World): void {
    this.instance = world.make(this.component);
  }
  
  public render(world: World): void {
    // Todo
  }

  /** @inheritDoc */
  public onInit(world: World, entity: Entity): void {
    world.attach(entity, new Host());

    // Call onInit lifecycle hook if it is implemented by the component.
    if (canInit(this.instance)) {
      this.instance.onInit(world, entity);
    }

    this.render(world);

    // this.root = this.instance.render(world);
    // this.instance.update(world);

    // The component node tree is always a child of this element.
    world.attach(this.root, new Parent(entity));
  }

  /** @inheritDoc */
  public onDestroy(world: World, entity: Entity): void {
    world.get(Hierarchy).destroy(world, this.root);

    if (canDestroy(this.instance)) {
      this.instance.onDestroy(world, entity);
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    // this.instance.update(world);
  }

}
