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
  TemplateElement,
  TemplateRenderer,
  UiElement,
  UiNode,
  UiText
} from '@heliks/tiles-ui';
import { assignJsxAttributes } from './attributes';
import { isJsxNode, JsxNode, JsxTemplateCondition } from './jsx-node';
import { TagType } from './metadata';
import { Style, TextStyle } from './style';
import { TagRegistry } from './tag-registry';
import { UiComponent } from './ui-component';


/** Template renderer for conditional JSX nodes that are elements. */
export class JsxTemplate implements TemplateRenderer {

  /**
   * @param root The root JSX node that is being rendered as template.
   */
  constructor(public readonly root: JsxNode) {}

  /** @inheritDoc */
  public render(world: World, owner: Entity): Entity {
    const nodes = world.storage<UiNode<Style>>(UiNode);
    const template = JsxRenderer.render(world, this.root, undefined, false);

    // The parent entity for the template is the parent of the owner of the template.
    const parent = world.storage(Parent).get(owner).entity;
    const parentNode = nodes.get(parent);

    // The position in the layout tree matters. The layout node of the template is
    // inserted at the same location as the template element.
    parentNode.layout.appendBefore(
      nodes.get(owner).layout,
      nodes.get(template).layout
    );
    
    world.attach(template, new Parent(parent));

    return template;
  }

}

/**
 *
 */
function createJsxEntity(world: World, node: JsxNode, textStyle?: TextStyle): Entity {
  const entry = world.get(TagRegistry).entry(node.tag);

  if (entry.type === TagType.Element) {
    return entry.factory.render(world, node.attributes, textStyle);
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
 * Wraps the given JSX `node` in a {@link TemplateElement template}.
 *
 * @param world Entity world.
 * @param condition The condition that will be bound to the template expression.
 * @param node JSX node that should be wrapped into a template.
 *
 * @see JsxTemplate
 */
export function createTemplateFromJsxNode(world: World, node: JsxNode, condition: JsxTemplateCondition): Entity {
  const element = new UiElement(new TemplateElement(
    new JsxTemplate(node)
  ));

  const uiNode = new UiNode();
  const entity = world.insert(uiNode, element);

  if (typeof condition === 'string') {
    element.bind('expression', condition);
  }
  else {
    element.value('expression', condition)
  }

  assignJsxAttributes(world, entity, uiNode, node.attributes);

  return entity
}

/**
 * Converts the given JSX `child` into a string.
 *
 * - `null` will be converted into `'null'`.
 * - Objects are parsed with `JSON.stringify`.
 * - Everything else is converted with `toString()`.
 */
export function stringifyUnknownJsxChild(child: unknown): string {
  if (child === null) {
    return 'null';
  }

  if (typeof child === 'object') {
    return JSON.stringify(child);
  }

  return child!.toString();
}

/** Returns the {@link UiComponent} instance of the given entity. */
export function getUiComponent<C extends UiComponent>(world: World, entity: Entity): C {
  return world
    .storage(UiElement<object, JsxRenderer<C>>)
    .get(entity)
    .instance
    .instance
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

  /**
   * Renders the given JSX `node` and returns its entity.
   *
   * The entity always contains a {@link UiNode} component and optionally a {@link UiElement}
   * component. If the node is {@link Attributes.if conditional}, it will be wrapped in
   * a {@link TemplateElement template}.
   *
   * The nodes' tag must be known to the {@link TagRegistry}.
   *
   * @param world World in which the created entity will be spawned.
   * @param node The JSX node from which the entity should be created.
   * @param textStyle Styling used for text inside of this node.
   * @param templates If set to `false`, `node` will be rendered, even if it is conditional.
   */
  public static render(world: World, node: JsxNode, textStyle?: TextStyle, templates = true): Entity {
    if (node.attributes.if && templates) {
      return createTemplateFromJsxNode(world, node, node.attributes.if);
    }

    // If the node declares its own text style, overwrite the inherited one. We will also
    // pass down this new style from now on.
    if (node.attributes.style?.text) {
      textStyle = node.attributes.style.text;
    }

    const entity = createJsxEntity(world, node, textStyle);
    const uiNode = world.storage<UiNode<Style>>(UiNode).get(entity);

    assignJsxAttributes(world, entity, uiNode, node.attributes);

    for (const _item of node.children) {
      if (_item === undefined) {
        continue;
      }

      const item = typeof _item === 'function' ? _item() : _item;

      let child;

      if (isJsxNode(item)) {
        child = JsxRenderer.render(world, item, textStyle, true);
      }
      else {
        const text = stringifyUnknownJsxChild(item);

        // Don't create text nodes for empty strings.
        if (text.trim().length === 0) {
          continue;
        }

        child = JsxRenderer.createText(world, text, textStyle);
      }

      // Attach the rendered node as a parent to all of its children.
      world.attach(child, new Parent(entity));
    }

    return entity;
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

  /** @inheritDoc */
  public getContext(): T {
    return this.instance;
  }

  /** @inheritDoc */
  public onBeforeInit(world: World): void {
    this.instance = world.make(this.component);
  }

  public render(world: World, parent: Entity): void {
    if (this.root !== undefined) {
      throw new Error('Component is already rendered and must be destroyed first.')
    }

    const entity = JsxRenderer.render(world, this.instance.render(world));

    world.attach(entity, new Parent(parent));

    this.root = entity;
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
