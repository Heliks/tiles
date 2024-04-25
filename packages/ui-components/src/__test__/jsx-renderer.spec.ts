import { App, Entity, Hierarchy, runtime, TransformBundle, World } from '@heliks/tiles-engine';
import { PassByReference, TemplateElement, UiElement, UiNode, UiText } from '@heliks/tiles-ui';
import { ElementFactory, TagRegistry } from '../element';
import { createJsxNode, JsxNode } from '../jsx';
import { createTemplateFromJsxNode, JsxRenderer, JsxTemplate } from '../jsx-renderer';
import { UiComponent } from '../ui-component';


class NoopFactory implements ElementFactory {

  /** @inheritDoc */
  public render(world: World): Entity {
    return world.insert(new UiNode());
  }

}

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
      .element('noop', new NoopFactory());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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

  class NoopComponent implements UiComponent {

    /** @inheritDoc */
    public render(): JsxNode {
      return createJsxNode('noop');
    }

  }

  describe('createTemplateFromJsxNode()', () => {
    let node: JsxNode;

    beforeEach(() => {
      node = createJsxNode('noop');
    });

    it('should bind template expression to given host property', () => {
      const entity = createTemplateFromJsxNode(world, node, 'foo');

      const template = world.storage<UiElement<{}, TemplateElement>>(UiElement).get(entity);
      const binding = template.bindings[0] as PassByReference;

      expect(binding).toBeInstanceOf(PassByReference);
      expect(binding).toMatchObject({
        local: 'expression',
        host: 'foo'
      });
    });

    it('should wrap JSX node in template', () => {
      const entity = createTemplateFromJsxNode(world, node, 'foo');

      const template = world
        .storage<UiElement<{}, TemplateElement<JsxTemplate>>>(UiElement)
        .get(entity)
        .instance;

      expect(template.renderer).toBeInstanceOf(JsxTemplate);
      expect(template.renderer.root).toBe(node);
    });
  });

  describe('render', () => {
    let hierarchy: Hierarchy;

    beforeEach(() => {
      hierarchy = world.get(Hierarchy);
    });

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


  /*
  describe('when rendering JSX node', () => {
    let renderer: JsxRenderer;

    beforeEach(() => {
      renderer = new JsxRenderer(NoopComponent);
    });

    it('should apply style attribute', () => {
      const style = {
        grow: 999
      };

      const entity = renderer.foo(world, {
        attributes: {
          style
        },
        children: [],
        tag: 'noop'
      });

      expect(
        world
          .storage(UiNode)
          .get(entity)
          .layout
          .style
      ).toMatchObject(style);
    });
  });

  // Todo: Idk, should prolly redo these tests as they depend too much on createText()
  describe('when rendering JSX node text children', () => {
    let renderer: JsxRenderer;
    let onCreateText: jest.SpyInstance;

    beforeEach(() => {
      renderer = new JsxRenderer(NoopComponent);
      onCreateText = jest.spyOn(JsxRenderer, 'createText');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should apply text style rule', () => {
      const style = new TextStyle();

      renderer.foo(world, {
        attributes: {
          style: {
            text: style
          }
        },
        children: [
          'foobar'
        ],
        tag: 'noop'
      });

      // Extract the style sheet with which the text is created.
      const applied = onCreateText.mock.calls[0][2];

      expect(applied).toBe(style);
    });

    it('should inherit text style from parent', () => {
      const style = new TextStyle(0xFFF000);

      renderer.foo(world, {
        attributes: {
          style: {
            text: style
          }
        },
        children: [
          {
            attributes: {},
            children: [
              {
                attributes: {},
                children: [
                  'foobar'
                ],
                tag: 'noop'
              }
            ],
            tag: 'noop'
          }
        ],
        tag: 'noop'
      });

      // Extract the style sheet with which the text is created.
      const applied = onCreateText.mock.calls[0][2];

      expect(applied).toBe(style);
    });
  });
   */
});
