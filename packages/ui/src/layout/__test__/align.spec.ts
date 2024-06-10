import { compute } from '../algo';
import { Node } from '../node';
import { Rect } from '../rect';
import { Sides } from '../sides';
import { Size } from '../size';
import { AlignContent, FlexDirection } from '../style';
import { fill, rect } from '../utils';


describe('align', () => {
  let space: Rect;

  beforeEach(() => {
    space = new Rect(100, 100);
  });

  it.each([
    {
      align: AlignContent.Start,
      expected: 0
    },
    {
      align: AlignContent.Center,
      expected: 37.5
    },
    {
      align: AlignContent.End,
      expected: 75
    },
  ])('should align content as $align on single line', data => {
    const node0 = new Node({
      align: data.align,
      size: fill()
    });

    const node1 = new Node({ size: rect(25) });
    const node2 = new Node({ size: rect(25) });
    const node3 = new Node({ size: rect(25) });

    node0.append(node1);
    node0.append(node2);
    node0.append(node3);

    compute(node0, space);

    expect(node1);
    expect(node2);
    expect(node3);

    expect(node1.pos.y).toBe(data.expected);
    expect(node2.pos.y).toBe(data.expected);
    expect(node2.pos.y).toBe(data.expected);
  });

  it.each([
    {
      align: AlignContent.Start,
      expected: {
        x: 0,
        y: 0
      }
    },
    {
      align: AlignContent.End,
      expected: {
        x: 0,
        y: 75
      }
    },
    {
      align: AlignContent.Center,
      expected: {
        x: 0,
        y: 37.5
      }
    }
  ])('should align content of container that has a flexible length in its cross axis', data => {
    const size = new Rect<Size>(
      Size.px(25),
      Size.px(25)
    );

    const node0 = new Node({
      direction: FlexDirection.Column,
      size: fill()
    });

    const node1 = new Node({ align: data.align, grow: 1 });
    const node2 = new Node({ size });

    node0.append(node1);
    node1.append(node2);

    compute(node0, space);

    expect(node2.pos).toMatchObject(data.expected);
  });

  it.each([
    {
      align: AlignContent.Start,
      expected: {
        x: 5,
        y: 5
      }
    },
    {
      align: AlignContent.Center,
      expected: {
        x: 5,
        y: 37.5
      }
    },
    {
      align: AlignContent.End,
      expected: {
        x: 5,
        y: 70
      }
    }
  ])('should take padding of flex container into account', data => {
    const node0 = new Node({
      align: data.align,
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
