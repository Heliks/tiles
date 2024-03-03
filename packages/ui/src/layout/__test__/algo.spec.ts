import { compute } from '../algo';
import { Node } from '../node';
import { Rect } from '../rect';
import { Sides } from '../sides';
import { Size } from '../size';
import { Display, FlexDirection, Style } from '../style';


/** @internal */
function setupItemNodes(root: Node, width: number, height: number, amount: number): void {
  for (let i = 0; i < amount; i++) {
    const node = new Node();

    node.size.setSides(width, height);

    root.add(node);
  }
}

function createTestNode(width: number, height: number, style: Partial<Style> = {}): Node {
  const node = new Node({
    size: new Rect(Size.px(width), Size.px(height)),
    ...style
  });


  node.size.width = width;
  node.size.height = height;


  return node;
}


describe('compute()', () => {
  let space: Rect;

  beforeEach(() => {
    space = new Rect(100, 100);
  });

  // https://www.w3.org/TR/css-flexbox-1/#algo-available
  describe('determine the available main and cross space for flex items', () => {
    it('when node has definite size', () => {
      const node = new Node({
        size: new Rect(
          Size.px(50),
          Size.px(25)
        )
      });

      compute(node, space);

      expect(node.constants.space).toMatchObject(new Rect(50, 25));
    });

    it('when node has auto sizes', () => {
      const node = new Node();

      compute(node, space);

      expect(node.constants.space).toMatchObject(space);
    });

    it('when node has a margin applied', () => {
      const node = new Node({
        margin: new Sides(10, 5, 10, 5)
      });

      compute(node, space);

      expect(node.constants.space).toMatchObject(new Rect(90, 80));
    });

    it('when node has a padding applied', () => {
      const node = new Node({
        padding: new Sides(5, 10, 15, 20)
      });

      compute(node, space);

      expect(node.constants.space).toMatchObject(new Rect(70, 80));
    });
  });

  // https://www.w3.org/TR/css-flexbox-1/#algo-main-item
  describe('determine the flex base size and hypothetical main size of each flex item', () => {
    let root: Node;
    let node: Node;

    beforeEach(() => {
      root = new Node();
      node = new Node();

      root.add(node);
    });

    it('with definite flex-basis', () => {
      node.style.basis = Size.px(50);

      compute(root, space);

      expect(node.constants.baseSize).toBe(50);
    });

    it('with definite flex-basis recursive', () => {
      const child = new Node();

      node.style.basis = Size.px(50);
      child.style.basis = Size.px(50);

      node.add(child);

      compute(root, space);

      expect(node.constants.baseSize).toBe(50);
      expect(child.constants.baseSize).toBe(50);
    });

    it('with flex-basis: content', () => {
      node.style.basis = Size.auto();

      node
        .add(
          new Node({
            size: new Rect<Size>(
              Size.px(50),
              Size.px(50)
            )
          })
        )
        .add(
          new Node({
            size: new Rect<Size>(
              Size.percent(0.25),
              Size.percent(0.25)
            )
          })
        );

      compute(root, space);

      expect(node.constants.baseSize).toBe(50);
    });

    it('with flex-basis: content recursive', () => {
      const child = new Node();

      node.style.basis = Size.auto();
      child.style.basis = Size.auto();

      // Add content to measure.
      child.add(
        new Node({
          size: new Rect<Size>(
            Size.px(50),
            Size.px(25)
          )
        })
      );

      node.add(child);

      compute(root, space);

      expect(node.constants.baseSize).toBe(50);
      expect(child.constants.baseSize).toBe(50);
    });

    it('with flex-basis: auto and definite px size', () => {
      node.style.basis = Size.auto();
      node.style.size = new Rect<Size>(
        Size.px(50),
        Size.px(50)
      );

      compute(root, space);

      expect(node.constants.baseSize).toBe(50);
    });

    it('with flex-basis: auto and percent size', () => {
      node.style.basis = Size.auto();
      node.style.size = new Rect<Size>(
        Size.percent(0.5),
        Size.percent(0.5)
      );

      compute(root, space);

      expect(node.constants.baseSize).toBe(50);
    });

    it('with flex-basis: auto and auto size', () => {
      node.style.basis = Size.auto();
      node.style.size = new Rect<Size>(
        Size.auto(),
        Size.auto()
      );

      // this should behave exactly as "content", therefore, add a content to node to
      // properly check this.
      node.add(
        new Node({
          size: new Rect<Size>(
            Size.px(25),
            Size.px(25)
          )
        })
      );

      compute(root, space);

      expect(node.constants.baseSize).toBe(25);
    });

    it('should determine the inner base size of each flex item', () => {
      node.style.basis = Size.px(25);
      node.style.padding = new Sides(0, 5, 0, 5);

      compute(root, space);

      expect(node.constants.innerBaseSize).toBe(15);
    });

    it('should calculate hypothetical inner main size', () => {
      node.style.basis = Size.px(50);

      compute(root, space);

      const main = node.constants.hypotheticalInnerSize.main(root.constants.isRow);

      expect(main).toBe(50);
    });

    it('should calculate hypothetical outer main size', () => {
      node.style.basis = Size.px(50);
      node.style.margin = new Sides(0, 5, 0, 5);

      compute(root, space);

      const main = node.constants.hypotheticalOuterSize.main(root.constants.isRow);

      expect(main).toBe(60);
    });
  });

  // https://www.w3.org/TR/css-flexbox-1/#algo-line-break
  describe('collect items into flex lines', () => {
    it('should add ', () => {
      const childA = new Node();
      const childB = new Node();

      const root = new Node()
        .add(childA)
        .add(childB);

      compute(root, space);

      const nodes = root.constants.lines[0].nodes;

      expect(nodes).toEqual([
        childA,
        childB
      ]);
    });

    it.each([
      new Rect(Size.px(25), Size.px(25)),
      new Rect(Size.px(75), Size.px(75))
    ])('should collect items into a single line', size => {
      const root = new Node();

      const childA = new Node({ size });
      const childB = new Node({ size });

      root.add(childA);
      root.add(childB);

      compute(root, space);

      const lines = root.constants.lines;

      expect(lines.length).toBe(1);
    });

    it.each([
      {
        direction: FlexDirection.Row,
        lines: 1,
        size: new Rect(
          Size.px(25),
          Size.px(50)
        ),
      },
      {
        direction: FlexDirection.Row,
        lines: 2,
        size: new Rect(
          Size.px(50),
          Size.px(50)
        ),
      },
      {
        direction: FlexDirection.Column,
        lines: 1,
        size: new Rect(
          Size.px(50),
          Size.px(25)
        )
      },
      {
        direction: FlexDirection.Column,
        lines: 2,
        size: new Rect(
          Size.px(50),
          Size.px(50)
        )
      },
    ])('should collect items into multiple lines', test => {
      const root = new Node({
        direction: test.direction,
        wrap: true
      });

      root
        .add(new Node({ size: test.size }))
        .add(new Node({ size: test.size }))
        .add(new Node({ size: test.size }));

      compute(root, space);

      const lines = root.constants.lines;

      expect(lines).toHaveLength(test.lines);
    });

    it('should take outer node size of flex items into account', () => {
      const root = new Node({
        wrap: true
      });

      // With a size of 33px x 33px three nodes should fit on the same line. However,
      // with a margin applied, the third item should no longer fit.
      const size = new Rect(
        Size.px(33),
        Size.px(33)
      );

      const margin = new Sides(5, 5, 5, 5);

      root
        .add(new Node({ margin, size }))
        .add(new Node({ margin, size }))
        .add(new Node({ margin, size }));

      compute(root, space);

      const lines = root.constants.lines;

      expect(lines).toHaveLength(2);
    });

    it('should not collect items with display:none', () => {
      const root = new Node();

      const childA = new Node();
      const childB = new Node({
        display: Display.None
      });

      root.add(childA);
      root.add(childB);

      compute(root, space);

      const nodes = root.constants.lines[0].nodes;

      expect(nodes).toEqual([
        childA
      ]);
    });
  });

  // https://www.w3.org/TR/css-flexbox-1/#algo-main-container
  describe('determine main size of flex container', () => {
    let node: Node;

    beforeEach(() => {
      node = new Node();
    });

    it('with definite size', () => {
      node.style.size = new Rect<Size>(
        Size.px(25),
        Size.px(50)
      );

      compute(node, space);

      expect(node.constants.size.width).toBe(25);
    });

    it('with percent based size', () => {
      node.style.size = new Rect<Size>(
        Size.percent(0.25),
        Size.percent(0.75)
      );

      compute(node, space);

      const main = node.constants.size.main(node.constants.isRow);

      expect(main).toBe(25);
    });

    it('with content size of definite sized items', () => {
      node.style.size = new Rect<Size>(
        Size.auto(),
        Size.auto()
      );

      const size = new Rect(
        Size.px(25),
        Size.px(50)
      );

      node
        .add(new Node({ size }))
        .add(new Node({ size }));

      compute(node, space);

      const main = node.constants.size.main(node.constants.isRow);

      expect(main).toBe(50);
    });

    it('with content size of auto sized content', () => {
      const auto = new Rect(Size.auto(), Size.auto());
      const size = new Rect(Size.px(25), Size.px(50));

      node.style.size = auto;

      // 50x100px
      const childA = new Node({ size: auto })
        .add(new Node({ size }))
        .add(new Node({ size }));

      // 50x100px
      const childB = new Node({ size: auto })
        .add(
          new Node({ size: auto })
            .add(new Node({ size }))
            .add(new Node({ size }))
        );

      node.add(childA);
      node.add(childB);

      compute(node, space);

      const main = node.constants.size.main(node.constants.isRow);

      expect(main).toBe(100);
    });
  });

  describe('resolve flexible lengths', () => {
    let root: Node;

    beforeEach(() => {
      root = new Node({
        size: new Rect(
          Size.percent(1),
          Size.percent(1)
        )
      });
    });

    it('should determine initial free space to distribute', () => {
      const size = new Rect(Size.px(25), Size.px(25));

      const childA = new Node({ grow: 0, size });
      const childB = new Node({ grow: 1, size });

      root.add(childA);
      root.add(childB);

      compute(root, space);

      expect(root.constants.initialFreeSpace).toBe(50);
    });

    it('should grow items proportional to their growth property', () => {
      const childA = new Node({ grow: 1 });
      const childB = new Node({ grow: 3 });

      root.add(childA);
      root.add(childB);

      compute(root, space);

      const mainA = childA.size.main(root.constants.isRow);
      const mainB = childB.size.main(root.constants.isRow);

      expect(mainA).toBe(25);
      expect(mainB).toBe(75);
    });

    it('should grow items alongside definite sized items', () => {
      const node = new Node({ grow: 1 });

      root
        .add(node)
        .add(
          new Node({
            grow: 0,
            size: new Rect(
              Size.px(50),
              Size.px(50)
            )
          })
        );

      compute(root, space);

      const main = node.size.main(root.constants.isRow);

      expect(main).toBe(50);
    });

    it('should grow items alongside shrinking items', () => {
      const node = new Node({ grow: 1 });

      root
        .add(node)
        .add(
          new Node({
            grow: 0,
            shrink: 1,
            size: new Rect(
              Size.px(50),
              Size.px(50)
            )
          })
        );

      compute(root, space);

      const main = node.size.main(root.constants.isRow);

      expect(main).toBe(50);
    });

    it('should shrink items proportional to their shrink property', () => {
      const size = new Rect(
        Size.px(100),
        Size.px(100)
      );

      const childA = new Node({ shrink: 1, size });
      const childB = new Node({ shrink: 3, size });

      root.add(childA);
      root.add(childB);

      compute(root, space);

      const mainA = childA.size.main(root.constants.isRow);
      const mainB = childB.size.main(root.constants.isRow);

      expect(mainA).toBe(75);
      expect(mainB).toBe(25);
    });

    it('should shrink items alongside definite sized items', () => {
      const node = new Node({ shrink: 1, basis: Size.px(100) });

      root
        .add(node)
        .add(
          new Node({
            grow: 0,
            size: new Rect(
              Size.px(25),
              Size.px(25)
            )
          })
        );

      compute(root, space);

      const main = node.size.main(root.constants.isRow);

      expect(main).toBe(75);
    });
  });

  describe('determine hypothetical cross size of each flex item', () => {
    it.each([
      {
        direction: FlexDirection.Row,
        inner: 25,
        outer: 45,
      },
      {
        direction: FlexDirection.Column,
        inner: 50,
        outer: 60
      }
    ])('for definite sized items', data => {
      const root = new Node({
        direction: data.direction
      });

      const node = new Node({
        margin: new Sides(10, 5, 10, 5),
        size: new Rect(
          Size.px(50),
          Size.px(25)
        )
      });

      root.add(node);

      compute(root, space);

      const inner = node.constants.hypotheticalInnerSize.cross(root.constants.isRow);
      const outer = node.constants.hypotheticalOuterSize.cross(root.constants.isRow);

      expect(inner).toBe(data.inner);
      expect(outer).toBe(data.outer);
    });

    it.each([
      {
        direction: FlexDirection.Row,
        node0: 10,
        node1: 10
      },
      {
        direction: FlexDirection.Column,
        node0: 20,
        node1: 10
      }
    ])('for leaf nodes', data => {
      const size = new Rect(
        Size.px(25),
        Size.px(10)
      );

      const root = new Node();

      const node0 = new Node({ direction: data.direction });
      const node1 = new Node({ size: size.clone() });
      const node2 = new Node({ size: size.clone() })

      node0.add(node1);
      node0.add(node2);
      
      root.add(node0);

      compute(root, space);

      const cross0 = node0.constants.hypotheticalInnerSize.cross(root.constants.isRow);
      const cross1 = node1.constants.hypotheticalInnerSize.cross(root.constants.isRow);

      expect(cross0).toBe(data.node0);
      expect(cross1).toBe(data.node1);
    });
  });

  describe('determine the cross size of each flex item', () => {
    let root: Node;

    beforeEach(() => {
      root = new Node({
        size: new Rect(
          Size.percent(1),
          Size.percent(1)
        )
      });
    });

    it.each([
      {
        direction: FlexDirection.Row,
        inner: 50
      },
      {
        direction: FlexDirection.Column,
        inner: 25
      }
    ])('for definite sized items', data => {
      root.style.direction = data.direction;

      const node = new Node({
        size: new Rect(
          Size.px(25),
          Size.px(50)
        )
      });

      root.add(node);

      compute(root, space);

      const cross = node.size.cross(root.constants.isRow);

      expect(cross).toBe(data.inner);
    });

    it.each([
      {
        direction: FlexDirection.Row,
        inner: 10
      },
      {
        direction: FlexDirection.Column,
        inner: 40
      }
    ])('for content sized items', data => {
      root.style.direction = data.direction;

      const node = new Node({
        size: new Rect(
          Size.auto(),
          Size.auto()
        )
      });

      const size = new Rect(
        Size.px(20),
        Size.px(10)
      );

      node
        .add(new Node({ size: size.clone() }))
        .add(new Node({ size: size.clone() }));

      root.add(node);

      compute(root, space);

      const cross = node.size.cross(root.constants.isRow);

      expect(cross).toBe(data.inner);
    });

    it.each([
      {
        direction: FlexDirection.Row,
        inner: 10
      },
      {
        direction: FlexDirection.Column,
        inner: 40
      }
    ])('for content sized items, recursive', data => {
      root.style.direction = data.direction;

      const auto = new Rect(
        Size.auto(),
        Size.auto()
      );

      const outer = new Node({ size: auto.clone() });
      const inner = new Node({ size: auto.clone() });

      const size = new Rect(
        Size.px(20),
        Size.px(10)
      );

      inner
        .add(new Node({ size: size.clone() }))
        .add(new Node({ size: size.clone() }));

      outer.add(inner);
      root.add(outer);

      compute(root, space);

      const cross = outer.size.cross(root.constants.isRow);

      expect(cross).toBe(data.inner);
    });

    it.each([
      {
        direction: FlexDirection.Row,
        inner: 20
      },
      {
        direction: FlexDirection.Column,
        inner: 60
      }
    ])('for content sized items, with children laid out in different directions', data => {
      root.style.direction = data.direction;

      const auto = new Rect(
        Size.auto(),
        Size.auto()
      );

      const outer = new Node({ size: auto.clone() });

      const inner1 = new Node({ direction: FlexDirection.Row, size: auto.clone() });
      const inner2 = new Node({ direction: FlexDirection.Column, size: auto.clone() });

      const size = new Rect(
        Size.px(20),
        Size.px(10)
      );

      // 40x10
      inner1
        .add(new Node({ size: size.clone() }))
        .add(new Node({ size: size.clone() }));

      // 20x20
      inner2
        .add(new Node({ size: size.clone() }))
        .add(new Node({ size: size.clone() }));

      outer
        .add(inner1)
        .add(inner2);

      root.add(outer);

      compute(root, space);

      const cross = outer.size.cross(root.constants.isRow);

      expect(cross).toBe(data.inner);
    });
  });


  beforeEach(() => {
    global.console = require('console');
  });

  it('foo', () => {
    const header = // Id:              4
      // Calculated size: 300x32px
      // Element: UiComponentRenderer (HeaderComponent)
      new Node({ align: 0,basis: Size.auto(),grow: 0,shrink: 0,direction: 1,display: 0,justify: 0,margin: new Sides(0, 0, 0, 0),padding: new Sides(0, 0, 0, 0),size: new Rect<Size>(Size.percent(1), Size.auto()),wrap: false})
        .add(
          // Id:              6
          // Calculated size: 160x32px
          new Node({ align: 1,basis: Size.auto(),grow: 0,shrink: 0,direction: 1,display: 0,justify: 1,margin: new Sides(0, 0, 0, 0),padding: new Sides(0, 0, 0, 0),size: new Rect<Size>(Size.percent(1), Size.px(32)),wrap: false})
        );

    const node =
      // Id:              1
// Calculated size: 0x320px
// Element: UiComponentRenderer (RaceSelectComponent)
      new Node({ align: 0,basis: Size.auto(),grow: 0,shrink: 0,direction: 1,display: 0,justify: 0,margin: new Sides(0, 0, 0, 0),padding: new Sides(0, 0, 0, 0),size: new Rect<Size>(Size.percent(1), Size.percent(1)),wrap: false})
        .add(
          // Id:              3
          // Calculated size: 180x320px
          // Element: UiSlicePlane
          new Node({ align: 0,basis: Size.auto(),grow: 0,shrink: 0,direction: 0,display: 0,justify: 0,margin: new Sides(0, 0, 0, 0),padding: new Sides(10, 10, 10, 10),size: new Rect<Size>(Size.percent(1), Size.percent(1)),wrap: false})
            .add(
              header
            )
            .add(
              // Id:              5
              // Calculated size: 0x268px
              new Node({ align: 0,basis: Size.auto(),grow: 1,shrink: 0,direction: 1,display: 0,justify: 0,margin: new Sides(0, 0, 0, 0),padding: new Sides(0, 0, 0, 0),size: new Rect<Size>(Size.auto(), Size.auto()),wrap: false})
            )
        )


    compute(node, new Rect(180, 320));

    console.log('--->')
    console.log(header.id, header.size)

    expect(header.size).toMatchObject(new Rect(160, 32));
  });

  /*
  it('foo', () => {
    const container = new Node({
      size: new Rect<Size>(
        Size.px(100),
        Size.px(100)
      )
    });

    for (let i = 0; i < 4; i++) {
      const child = new Node({
        size: new Rect(
          Size.px(10),
          Size.px(10)
        )
      });

      (child as any).i = i;

      container.add(child);
    }

    const child = new Node({
      grow: 1,
      size: new Rect(
        Size.px(10),
        Size.px(10)
      )
    });

    (child as any).i = 5;

    container.add(child);

    compute(container, new Rect(100, 200));

    for (const child of container.children) {
      console.log((child as any).i);
    }
  });
  */
});
