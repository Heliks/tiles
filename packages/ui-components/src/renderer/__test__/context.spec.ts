import { UiElement } from '@heliks/tiles-ui';
import { AttributeContextBindingKeyword, setContextBinding } from '../context';
import { NoopElement } from './noop-element';


describe('context', () => {
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
});
