import { SortChildren } from '../sort-children';
import { Layers } from '../layers';


describe('SortChildren', () => {
  it('should sort all renderer layers', () => {
    const layers = new Layers();
    const system = new SortChildren(layers);

    const sort = jest.fn();

    layers.add('foo').sort = sort;

    system.update();

    expect(sort).toHaveBeenCalled();
  });
});
