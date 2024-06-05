import { compute } from '../algo';
import { Node } from '../node';
import { Rect } from '../rect';
import { Sides } from '../sides';
import { Size } from '../size';
import { AlignContent, FlexDirection } from '../style';
import { fill, rect } from '../utils';


describe('justify', () => {
  let space: Rect;

  beforeEach(() => {
    space = new Rect(100, 100);
  });

  it.each([
    {
      justify: AlignContent.Start,
      results: {
        node1: { x: 0, y: 0 },
        node2: { x: 20, y: 0 },
        node3: { x: 40, y: 0 }
      }
    },
    {
      justify: AlignContent.Center,
      results: {
        node1: { x: 20, y: 0 },
        node2: { x: 40, y: 0 },
        node3: { x: 60, y: 0 }
      }
    },
    {
      justify: AlignContent.End,
      results: {
        node1: { x: 40, y: 0 },
        node2: { x: 60, y: 0 },
        node3: { x: 80, y: 0 }
      }
    },
    {
      justify: AlignContent.SpaceAround,
      results: {
        node1: { x: 6.666666666666667, y: 0 },
        node2: { x: 40, y: 0 },
        node3: { x: 73.33333333333333, y: 0 }
      }
    },
    {
      justify: AlignContent.SpaceBetween,
      results: {
        node1: { x: 0, y: 0 },
        node2: { x: 40, y: 0 },
        node3: { x: 80, y: 0 }
      }
    },
    {
      justify: AlignContent.SpaceEvenly,
      results: {
        node1: { x: 10, y: 0 },
        node2: { x: 40, y: 0 },
        node3: { x: 70, y: 0 }
      }
    },
  ])('should justify content as $justify on single line', data => {
    const node0 = new Node({
      justify: data.justify,
      size: new Rect<Size>(
        Size.percent(1),
        Size.percent(1)
      )
    });

    const node1 = new Node({ size: rect(20) });
    const node2 = new Node({ size: rect(20) });
    const node3 = new Node({ size: rect(20) });

    node0.append(node1);
    node0.append(node2);
    node0.append(node3);

    compute(node0, space);

    expect(node1.pos).toMatchObject(data.results.node1);
    expect(node2.pos).toMatchObject(data.results.node2);
    expect(node3.pos).toMatchObject(data.results.node3);
  });

  it.each([
    {
      justify: AlignContent.Start,
      expected: {
        x: 5,
        y: 5
      }
    },
    {
      justify: AlignContent.Center,
      expected: {
        x: 5,
        y: 37.5
      }
    },
    {
      justify: AlignContent.End,
      expected: {
        x: 5,
        y: 70
      }
    }
  ])('should take padding of flex container into account', data => {
    const node0 = new Node({
      direction: FlexDirection.Column,
      justify: data.justify,
      padding: new Sides(5, 5, 5, 5),
      size: fill()
    });

    const node1 = new Node({
      size: new Rect<Size>(
        Size.percent(1),
        Size.px(25)
      )
    });

    node0.append(node1);

    compute(node0, space);

    expect(node1.pos).toMatchObject(data.expected);
  });
});
