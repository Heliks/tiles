import { ComponentList } from '../component-list';


class Foo {}

describe('ComponentList', () => {
  let list: ComponentList;

  beforeEach(() => {
    list = new ComponentList();
  });

  describe('when adding components to the list', () => {
    it('should return true if a component was successfully added to the list', () => {
      expect(list.add(new Foo())).toBeTruthy();
    });

    it('should only add one component per type', () => {
      list.add(new Foo());

      const result = list.add(new Foo());

      expect(result).toBeFalsy();
    });

    it('should add a component to the list', () => {
      const component = new Foo();

      list.add(component);

      const result = list.get(Foo);

      expect(result).toBe(component);
    });
  })

});