import { Entity, Hierarchy, Parent, Type, World } from '@heliks/tiles-engine';
import {
  canDestroy,
  canInit,
  Element,
  Host,
  OnBeforeInit,
  OnDestroy,
  OnInit,
  UiElement,
  UiNode,
  UiText
} from '@heliks/tiles-ui';
import { ElementRegistry } from './element';
import { Node } from './jsx';
import { Style, TextStyle } from './style';
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

  public static createText(world: World, parent: Entity, text: string, style?: TextStyle): Entity {
    const element = new UiText(text);

    if (style) {
      element.view.style = style;
    }

    return world.insert(
      new UiNode(),
      new UiElement(element),
      new Parent(parent)
    );
  }

  public foo(world: World, node: Node<UiComponent>, textStyle?: TextStyle): Entity {
    let entity;

    if (typeof node.tag !== 'string') {
      entity = world.insert(
        new UiNode(),
        new UiElement(new JsxRenderer(node.tag))
      );
    }
    else {
      const factory = world.get(ElementRegistry).tag(node.tag);

      if (! factory) {
        throw new Error(`Invalid tag name ${node.tag}`);
      }

      entity = factory.render(world, node.attributes);
    }

    const nodes = world.storage<UiNode<Style>>(UiNode);
    const uiNode = nodes.get(entity);

    // If node has the style attribute, assign it to the nodes original style.
    if (node.attributes.style) {
      Object.assign(uiNode.layout.style, node.attributes.style);
    }

    if (uiNode.style.text) {
      textStyle = uiNode.style.text;
    }

    // Produce children and attach them as children to the current node.
    for (const item of node.children) {
      if (typeof item === 'string') {
        JsxRenderer.createText(world, entity, item, textStyle);
      }
      else {
        world.attach(this.foo(world, item, textStyle), new Parent(entity));
      }
    }

    return entity;
  }

  public render(world: World, parent: Entity): void {
    const node = this.instance.render(world);

    const entity = this.foo(world, node);

    console.log('GOT ENTITY', entity)

    world.attach(entity, new Parent(parent));




    /*
    let renderer = this.registry.tag(tag.tag);

    if (! renderer) {
      throw new Error('Invalid renderer');
    }

    const nodes = world.storage(UiNode);
    const entity = renderer.render(world, tag.attributes);

    console.log('Attributes', tag.attributes)

    // If node has the style attribute, assign it to the nodes original style.
    if (tag.attributes.style) {
      Object.assign(nodes.get(entity).layout.style, tag.attributes.style);
    }

    /*
    const t = (0, jsx_runtime_1.jsx)("fill", { children: (0, jsx_runtime_1.jsx)("slice-plane", { spritesheet: this.spritesheet, sprite: "window_frame2", sides: "32", style: {
          direction: tiles_ui_1.FlexDirection.Column,
          padding: new tiles_ui_1.Sides(10, 10, 15, 10),
          size: new tiles_ui_1.Rect(tiles_ui_1.Size.percent(1), tiles_ui_1.Size.percent(1))
        } }) });

    // Produce children.
    for (const item of tag.children) {
      world.attach(this.render(world, item), new Parent(entity));
    }

    return entity;

     */
  }

  /** @inheritDoc */
  public onInit(world: World, entity: Entity): void {
    world.attach(entity, new Host());

    // Call onInit lifecycle hook if it is implemented by the component.
    if (canInit(this.instance)) {
      this.instance.onInit(world, entity);
    }

    this.render(world, entity);

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
