import { Entity, hasOnInit, Hierarchy, Parent, Type, World } from '@heliks/tiles-engine';
import { UiComponent } from '../ui-component';
import { UiWidget } from '../ui-widget';


/**
 * Renders a {@link UiComponent} on the entity to which this component is attached to.
 *
 * The node tree that is created when the {@link UiComponent} is rendered, will always
 * be a child of the owner of this component.
 *
 * When the owner of this component is destroyed, the UI component will be de-spawned
 * from the world as well.
 *
 * - `T`: The UI Component type that is rendered by this element.
 */
export class UiComponentRenderer<T extends UiComponent = UiComponent> implements UiWidget {

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
  public getContextInstance(): T {
    return this.instance;
  }

  /** @inheritDoc */
  public onInit(world: World, entity: Entity): void {
    this.instance = world.make(this.component);

    // Call onInit lifecycle hook if it is implemented by the component.
    if (hasOnInit(this.instance)) {
      this.instance.onInit(world);
    }

    this.root = this.instance.render(world);

    // The component node tree is always a child of this widget.
    world.attach(this.root, new Parent(entity));
  }

  /** @inheritDoc */
  public onDestroy(world: World): void {
    world.get(Hierarchy).destroy(world, this.root);
  }

  /** @inheritDoc */
  public update(): void {
    return;
  }

}
