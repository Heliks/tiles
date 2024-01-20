import { ComponentList } from '../component-list';
import { World } from '../world';


class Foo {}

describe('ComponentList', () => {
  let list: ComponentList;

  beforeEach(() => {
    list = new ComponentList();
  });

  it('should create a list with all components owned by an entity', () => {
    const world = new World();

    class Foo {}
    class Bar {}

    const foo = new Foo();
    const bar = new Bar();

    const entity = world.insert(foo, bar);

    const list = ComponentList.from(world, entity);

    expect(list.size()).toBe(2);
    
    expect(list.get(Foo)).toBe(foo);
    expect(list.get(Bar)).toBe(bar);
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