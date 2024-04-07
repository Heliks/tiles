import { App, Entity, Hierarchy, runtime, TransformBundle, World } from '@heliks/tiles-engine';
import { UiElement, UiNode, UiText } from '@heliks/tiles-ui';
import { ElementFactory, TagRegistry } from '../element';
import { Node } from '../jsx';
import { JsxRenderer } from '../jsx-renderer';
import { TextStyle } from '../style';
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
    public render(): Node<UiComponent> {
      return {
        attributes: {},
        children: [],
        tag: 'noop'
      }
    }

  }

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
});
