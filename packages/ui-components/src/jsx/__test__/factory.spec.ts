import { jsx } from '../factory';
import { JsxNode } from '../jsx-node';


function noop(tag: string): JsxNode {
  return {
    attributes: {},
    children: [],
    tag
  };
}

describe('jsx()', () => {
  it('should parse single child', () => {
    const node1 = noop('foo');
    const node2 = jsx('bar', { children: node1 });

    expect(node2.children).toEqual([
      node1
    ]);
  });

  it('should parse no children', () => {
    const node1 = noop('foo');
    const node2 = jsx('bar', {});

    expect(node2.children).toEqual([]);
  });
});
