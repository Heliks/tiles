import { compute } from '../algo';
import { Node } from '../node';
import { Rect } from '../rect';
import { Sides } from '../sides';
import { Size } from '../size';
import { AlignContent, FlexDirection } from '../style';
import { fill } from '../utils';


describe('justify', () => {
  let space: Rect;

  beforeEach(() => {
    space = new Rect(100, 100);
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
