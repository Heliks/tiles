import { Entity, Hierarchy, Parent, Type, World } from '@heliks/tiles-engine';
import {
  canDestroy,
  canInit,
  Element,
  Host,
  OnBeforeInit,
  OnDestroy,
  OnInit,
  Rect,
  Size,
  UiElement,
  UiNode,
  UiText
} from '@heliks/tiles-ui';
import { TagRegistry, TagType } from './element';
import { Node } from './jsx';
import { assignJsxAttributes } from './renderer/attributes';
import { Style, TextStyle } from './style';
import { UiComponent } from './ui-component';


/**
 * Creates an entity from the given JSX `node`. The entity that is being returned must
 * always contain a {@link UiNode} component. This is only supported for nodes that use
 * a tag name. Class or function components are not supported.
 *
 * The tag must be known to the {@link TagRegistry}.
 *
 * @param world World in which the created entity will be spawned.
 * @param node The JSX node from which the entity should be created.
 */
export function createUiNode(world: World, node: Node<UiComponent>): Entity {
  if (typeof node.tag !== 'string') {
    console.error(node)
    throw new Error('Class and function components are not supported. Use the lowercase tag format instead.');
  }

  const entry = world.get(TagRegistry).entry(node.tag);

  if (! entry) {
    throw new Error(`Invalid tag <${node.tag}>`);
  }

  if (entry.type === TagType.Element) {
    return entry.factory.render(world, node.attributes);
  }

  return world.insert(
    new UiElement(new JsxRenderer(entry.component)),
    // Make sure to spawn the UiNode as a block element by default. This can later be
    // overwritten with the `style` attribute.
    new UiNode({
      size: new Rect<Size>(
        Size.percent(1),
        Size.auto()
      )
    })
  );
}



/**
 * A {@link UiElement} that renders a {@link UiComponent} on the entity to which this
 * component is attached to.
 *
 * The node tree that is created during the rendering of the {@link UiComponent} will
 * always be a child of the owner of this component. When the owner is destroyed, the UI
 * component and the entities that it spawned, will be destroyed as well.
 *
 * Components are block elements by default (width: `100%` and height: `auto`). This can
 * be changed by overwriting the components' stylesheet.
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

  public static createText(world: World, text: string, style?: TextStyle): Entity {
    const element = new UiText(text);

    if (style) {
      element.view.style = style;
    }

    return world.insert(
      new UiNode(),
      new UiElement(element)
    );
  }



  public foo(world: World, node: Node<UiComponent>, textStyle?: TextStyle): Entity {
    const entity = createUiNode(world, node);

    const nodes = world.storage<UiNode<Style>>(UiNode);
    const uiNode = nodes.get(entity);

    assignJsxAttributes(world, entity, uiNode, node.attributes);

    // If the node declares its own text style, overwrite the inherited one. We will also
    // pass down this new style from now on.
    if (uiNode.style.text) {
      textStyle = uiNode.style.text;
    }

    for (const item of node.children) {
      // If the child is another JSX node and not a text, recursively render it until
      // we are at the bottom of the tree.
      const child = typeof item !== 'string' ? this.foo(world, item, textStyle) : JsxRenderer.createText(world, item, textStyle);

      // Attach the rendered node as a parent to all of its children.
      world.attach(child, new Parent(entity));
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
