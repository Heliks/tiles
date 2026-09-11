import { App, Entity, Hierarchy, runtime, TransformBundle, World } from '@heliks/tiles-engine';
import {
  ContextRef,
  Element,
  PassByFunction,
  PassByValue,
  TemplateElement,
  UiElement,
  UiNode,
  UiText
} from '@heliks/tiles-ui';
import { bind } from '../bind';
import { createJsxNode, JsxNode } from '../jsx-node';
import { bindAttrs, createTemplateFromJsxNode, JsxRenderer, JsxTemplate } from '../jsx-renderer';
import { TagRegistry } from '../tag-registry';
import { UiNodeRenderer } from '../ui-node-renderer';


class NoopFactory implements UiNodeRenderer {

  /** @inheritDoc */
  public render(world: World): Entity {
    return world.insert(new UiNode());
  }

}

describe('bindAttrs()', () => {
  let element: UiElement;

  beforeEach(() => {
    element = new UiElement({
      update: jest.fn(),
      getContext: jest.fn()
    });

    element.context = ContextRef.from(element);

    element.bind = jest.fn();
    element.value = jest.fn();

  });

  it('should bind attributes as value to element context', () => {
    bindAttrs(element, {
      foo: 'bar'
    });

    expect(element.value).toHaveBeenCalledWith('foo', 'bar');
  });

  it('should bind attributes as function to element context', () => {
    const getter = () => 'bar';

    bindAttrs(element, {
      foo: bind(getter)
    });

    expect(element.bind).toHaveBeenCalledWith('foo', getter);
  });

  it('should add attribute name as input to element context', () => {
    bindAttrs(element, {
      foo: 'bar'
    });

    const result = element.context.inputs.has('foo');

    expect(result).toBeTruthy();
  });

  it('should not bind default attributes', () => {
    bindAttrs(element, {
      foo: 'bar',
      style: {}
    });

    expect(element.value).toHaveBeenCalledTimes(1);
    expect(element.value).toHaveBeenCalledWith('foo', 'bar');
  });
});

describe('JsxRenderer', () => {
  let app: App;
  let world: World;
  let hierarchy: Hierarchy;
  let registry: TagRegistry;

  beforeEach(() => {
    app = runtime()
      .bundle(new TransformBundle())
      .provide(TagRegistry)
      .build();

    app.start({
      update: jest.fn()
    })

    world = app.world;

    hierarchy = world.get(Hierarchy);

    registry = world
      .get(TagRegistry)
      .node('noop', new NoopFactory());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function getUiElement<T extends Element = TemplateElement>(entity: Entity): UiElement<{}, T> {
    return world.storage<UiElement<{}, T>>(UiElement).get(entity);
  }

  // Todo: Should move this functionality to Hierarchy resource at some point.
  function getChildren(parent: Entity): Entity[] {
    const children = hierarchy.children.get(parent);

    if (! children) {
      throw new Error(`Entity ${parent} has no children`);
    }

    return children;
  }

  describe('createText()', () => {
    let root: Entity;

    beforeEach(() => {
      root = world.insert();
    });

    it('should return an entity', () => {
      expect(JsxRenderer.createText(world, '')).not.toBeUndefined();
    });

    it('should attach UiNode component to text entity', () => {
      const entity = JsxRenderer.createText(world, '');

      expect(world.storage(UiNode).has(entity)).toBeTruthy();
    });

    it('should attach UiElement component with UiText element to text entity', () => {
      const entity = JsxRenderer.createText(world, 'foobar');
      const element = world.storage(UiElement).get(entity);

      // Make sure the UiElement used by the text node is a UiText using "bar" as text.
      expect(element.instance).toBeInstanceOf(UiText);
      expect(element.instance.text).toBe('foobar');
    });
  });

  describe('createTemplateFromJsxNode()', () => {
    let node: JsxNode;

    beforeEach(() => {
      node = createJsxNode('noop');
    });

    it('should bind value to template expression', () => {
      const entity = createTemplateFromJsxNode(world, node, 'foo');
      const binding = getUiElement(entity).bindings[0];

      expect(binding).toBeInstanceOf(PassByValue);
      expect(binding).toMatchObject({ local: 'expression', value: 'foo' });
    });

    it('should bind one way binding to template expression', () => {
      const getter = jest.fn();
      const entity = createTemplateFromJsxNode(world, node, bind(getter));
      const binding = getUiElement(entity).bindings[0];

      expect(binding).toBeInstanceOf(PassByFunction);
      expect(binding).toMatchObject({ local: 'expression', fn: getter });
    });

    it('should wrap node in JsxTemplate', () => {
      const entity = createTemplateFromJsxNode(world, node, 'foo');
      const template = getUiElement<TemplateElement<JsxTemplate>>(entity).instance;

      expect(template.renderer).toBeInstanceOf(JsxTemplate);
      expect(template.renderer.root).toBe(node);
    });
  });

  describe('render', () => {
    describe('when rendering functions', () => {
      it('should render return value', () => {
        const node0 = createJsxNode('noop');
        const node1 = createJsxNode('noop', {}, [
          () => node0
        ]);

        const spy = jest.spyOn(JsxRenderer, 'render');

        JsxRenderer.render(world, node1);

        expect(spy).toHaveBeenNthCalledWith(2, world, node0, undefined, true);
      });
    });
  });
});
