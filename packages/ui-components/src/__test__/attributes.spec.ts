import { Entity, runtime, World } from '@heliks/tiles-engine';
import { UiElement, UiNode } from '@heliks/tiles-ui';
import {
  applyStyleRules,
  assignJsxAttributes,
  AttributeContextBindingKeyword,
  getAttributeContextBindingParams,
  setContextBinding
} from '../attributes';
import { clearRules, setRule } from '../rules';
import { NoopElement } from './noop-element';


describe('attributes', () => {
  let world: World;

  beforeEach(() => {
    world = runtime().build().world;
  });

  describe('getAttributeContextBindingParams()', () => {
    it.each([
      {
        name: 'foo:bar',
        expected: ['foo', 'bar']
      },
      { 
        name: 'foobar',
        expected: undefined
      },
      {
        name: 'foo-bar:foobar',
        expected: ['fooBar', 'foobar']
      },
    ])('should extract context params from attribute name: $name', data => {
      expect(getAttributeContextBindingParams(data.name)).toEqual(data.expected)
    });
  });

  describe('setContextBinding()', () => {
    let element: UiElement;

    beforeEach(() => {
      element = new UiElement(new NoopElement());
    });

    it('should bind attribute value as value to element context', () => {
      element.value = jest.fn();

      const val = Symbol();

      setContextBinding(element, 'value', val, AttributeContextBindingKeyword.Value);

      expect(element.value).toHaveBeenCalledWith('value', val);
    });

    it('should bind attribute value as name of local property to element context', () => {
      element.bind = jest.fn();

      const val = 'local';

      setContextBinding(element, 'prop', val, AttributeContextBindingKeyword.OneWay);

      expect(element.bind).toHaveBeenCalledWith('prop', val);
    });

    it('should throw when attribute value is not a string and bound as local property', () => {
      expect(() => {
        setContextBinding(element, 'prop', undefined, AttributeContextBindingKeyword.OneWay);
      }).toThrow();
    });
  });

  describe('assignJsxAttributes()', () => {
    let entity: Entity;
    let node: UiNode;

    beforeEach(() => {
      node = new UiNode();
      entity = world.insert(node);
    });

    it('should apply "style" attribute to UI node stylesheet', () => {
      const style = {
        grow: 100,
        shrink: 200
      }

      assignJsxAttributes(world, entity, node, {
        style
      })

      expect(node.style).toMatchObject(style);
    });

    it.each([ true, false ])('should make UI node interactive when "events" attribute is set', result => {
      assignJsxAttributes(world, entity, node, {
        events: result
      });

      expect(node.interactive).toBe(result);
    });
  });

  describe('applyStyleRules()', () => {
    let node: UiNode;

    beforeEach(() => {
      node = new UiNode();
    });

    afterEach(() => {
      clearRules();
    });

    it('should apply class styles', () => {
      setRule('foo', {
        wrap: true
      });

      applyStyleRules(node, {
        class: 'foo'
      });

      expect(node.layout.style.wrap).toBe(true);
    });

    it('should apply multiple class styles', () => {
      setRule('foo', {
        shrink: 0,
        wrap: true
      });

      setRule('bar', {
        grow: 1,
        shrink: 1
      });

      applyStyleRules(node, {
        class: 'foo bar'
      });

      expect(node.layout.style).toMatchObject({
        grow: 1,
        shrink: 1,
        wrap: true
      });
    });

    it('should overwrite class styles with local styles', () => {
      setRule('foo', {
        wrap: true,
        grow: 5
      })

      applyStyleRules(node, {
        class: 'foo',
        style: {
          wrap: false,
          grow: 6
        }
      });

      expect(node.layout.style).toMatchObject({
        wrap: false,
        grow: 6
      })
    });
  });
});
