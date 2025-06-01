import { Entity, Hierarchy, Parent, Type, World } from '@heliks/tiles-engine';
import {
  canDestroy,
  canInit,
  ContextRef,
  Element,
  Host,
  OnDestroy,
  OnInit,
  Rect,
  Size,
  Style,
  TemplateElement,
  TemplateRenderer,
  TextStyle,
  UiElement,
  UiNode,
  UiText
} from '@heliks/tiles-ui';
import { assignJsxAttributes } from './attributes';
import { isBinding } from './bind';
import { Attributes, isJsxNode, JsxNode, JsxTemplateCondition } from './jsx-node';
import { getResourceMetadata, ResourceType } from './metadata';
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
 * Contains the keys of all default {@link Attributes}.
 */
const DEFAULT_ATTRIBUTE_NAMES: Set<keyof Attributes> = new Set([
  'data',
  'events',
  'bubble',
  'if',
  'ref',
  'style'
]);

/**
 * Binds the given `attributes` to `element`. Default attributes will be ignored. Values
 * that contain a {@link OneWayBinding} will be bound with {@link PassByFunction}. Other
 * values with {@link PassByValue}. Attributes that are bound will be set as input on the
 * elements' context.
 */
export function bindAttrs(element: UiElement, attributes: Attributes): void {
  for (const name in attributes) {
    // Default attributes are processed directly and therefore don't need to be bound
    // to the elements' context.
    if (DEFAULT_ATTRIBUTE_NAMES.has(name)) {
      continue;
    }

    // Context might not be initialized yet when the element is not a UI component. This
    // can be safely skipped, as other types of UI resource will control their inputs
    // via `@Input()` decorator.
    element.context?.inputs.add(name);

    const value = attributes[name];

    if (isBinding(value)) {
      element.bind(name, value.$$get);
    }
    else {
      element.value(name, value);
    }
  }
}

/**
 * Spawns the given UI `component` into the world.
 *
 * @param world Entity world where UI is spawned.
 * @param component The UI component to spawn.
 * @param attributes Attributes to apply to the UI component.
 */
export function createUi(world: World, component: Type<UiComponent>, attributes: Attributes = {}): Entity {
  const meta = getResourceMetadata(component);

  if (meta.type !== ResourceType.Component && meta.type !== ResourceType.ComponentStandalone) {
    throw new Error('Invalid resource metadata. Component expected.');
  }

  const context = world.make(component);
  const element = new UiElement(new JsxRenderer(context));

  // Make sure this really exists, as we don't want to force components to always set
  // a default type for their props object.
  if (! context.props) {
    context.props = {};
  }

  // Observed view is the element. The referenced context are component props.
  element.context = new ContextRef(context.props, context);

  bindAttrs(element, attributes);

  return world.insert(
    element,
    new UiNode(meta.options.style ?? {
      size: new Rect<Size>(
        Size.percent(1),
        Size.auto()
      )
    })
  );
}

function createJsxElement(world: World, node: JsxNode, text?: TextStyle): Entity {
  if (typeof node.tag === 'function') {
    return createUi(world, node.tag, node.attributes);
  }

  const entry = world.get(TagRegistry).entry(node.tag);

  if (entry.type !== ResourceType.Node) {
    return createUi(world, entry.component, node.attributes);
  }

  const entity = entry.renderer.render(world, node.attributes, text);
  const store = world.storage(UiElement);

  // This binds attributes
  if (store.has(entity)) {
    bindAttrs(store.get(entity), node.attributes);
  }

  return entity;
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

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return child!.toString();
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
 * be changed by overwriting the components' stylesheet or by setting a default style
 * via the component options.
 *
 * - `T`: The UI Component type that is rendered by this element.
 */
export class JsxRenderer<T extends UiComponent = UiComponent> implements Element, OnInit, OnDestroy {

  /**
   * Invalidating the component will destroy the entity hierarchy and rebuilds them
   * on the same frame.
   */
  public invalid = false;

  /**
   * Contains the root entity of the {@link UiNode} tree that is being rendered by
   * this UI component.
   */
  public root?: Entity;

  /**
   * @param instance Instance of the {@link UiComponent} that is to be rendered when the
   * owner of this component is spawned into the world. When that owner is destroyed,
   *  the component instance will be destroyed as well.
   */
  constructor(public readonly instance: T) {}

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

    const entity = createJsxElement(world, node, textStyle);
    const uiNode = world.storage<UiNode>(UiNode).get(entity);

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

    return world.insert(
      new UiNode({
        text: style
      }),
      new UiElement(element)
    );
  }

  /** @inheritDoc */
  public getContext(): object {
    return this.instance;
  }

  public render(world: World, parent: Entity): void {
    if (this.root !== undefined) {
      throw new Error('Component is already rendered and must be destroyed first.')
    }

    const node = this.instance.render(world, parent);
    const entity = JsxRenderer.render(world, node);



    // console.log('rendered', node)



    world.attach(entity, new Parent(parent));

    this.root = entity;
  }

  public destroy(world: World, entity: Entity): void {
    if (! this.root) {
      return;
    }

    world.get(Hierarchy).destroy(world, this.root);

    if (canDestroy(this.instance)) {
      this.instance.onDestroy(world, entity);
    }

    this.root = undefined;
  }

  /** @inheritDoc */
  public onInit(world: World, entity: Entity): void {
    // This case happens when the parent component is destroyed before its children
    // are initialized. The renderer will discard this entity and insert another in
    // its place, therefore, the initialization needs to be canceled here or the
    // component will be rendered twice.
    if (! world.alive(entity)) {
      return;
    }

    world.attach(entity, new Host());

    // Call onInit lifecycle hook if it is implemented by the component.
    if (canInit(this.instance)) {
      this.instance.onInit(world, entity);
    }

    this.render(world, entity);
  }

  /** @inheritDoc */
  public onDestroy(world: World, entity: Entity): void {
    this.destroy(world, entity);
  }

  /** @inheritDoc */
  public update(world: World, entity: Entity): void {
    if (this.invalid) {
      this.destroy(world, entity);
      this.render(world, entity);
      this.invalid = false;
    }

    this.instance.update?.(world, entity);
    
    return;
  }

}
