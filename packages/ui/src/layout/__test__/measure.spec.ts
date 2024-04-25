import { compute } from '../algo';
import { Node } from '../node';
import { Rect } from '../rect';
import { Sides } from '../sides';
import { Size } from '../size';
import { FlexDirection } from '../style';


const SIZE_FILL = new Rect<Size>(
  Size.percent(1),
  Size.percent(1)
);

const SIZE_HALF = new Rect<Size>(
  Size.percent(0.5),
  Size.percent(0.5)
);

const SIZE_AUTO = new Rect<Size>(
  Size.auto(),
  Size.auto()
)

describe('compute', () => {
  let space: Rect;

  beforeEach(() => {
    space = new Rect(100, 100);

    // Enable to remove Jest's verbose logging.
    global.console = require('console');
  });

  // Base size tests.
  describe('when calculating base size', () => {
    let root: Node;
    let node: Node;

    beforeEach(() => {
      root = new Node();
      node = new Node();

      root.append(node);
    });

    it('should be determined from definite flex-basis', () => {
      node.style.basis = Size.px(50);

      compute(root, space);

      expect(node.constants.baseSize).toBe(50);
    });

    it.each([
      {
        direction: FlexDirection.Row,
        expected: 25
      },
      {
        direction: FlexDirection.Column,
        expected: 12.5
      },
    ])('should be determined from percentage based flex-basis', data => {
      root.style.size.width = Size.px(50);
      root.style.size.height = Size.px(25);
      root.style.direction = data.direction;

      node.style.basis = Size.percent(0.5);

      compute(root, space);

      expect(node.constants.baseSize).toBe(data.expected);
    });
  });

  // Container measurement.
  describe('when measuring flex container', () => {
    it('should measure definite sized container', () => {
      const node = new Node({
        size: new Rect<Size>(
          Size.px(30),
          Size.px(25)
        )
      });

      compute(node, space);

      expect(node.size).toMatchObject(new Rect(30, 25));
    });

    it('should measure percentage sized container', () => {
      const node = new Node({
        size: new Rect<Size>(
          Size.percent(0.7),
          Size.percent(0.5)
        )
      });

      compute(node, space);

      expect(node.size).toMatchObject(new Rect(70, 50));
    });

    it('should measure content sized container', () => {
      const node0 = new Node({
        size: SIZE_AUTO.clone()
      });

      node0
        .append(
          new Node({
            size: new Rect<Size>(
              Size.px(20),
              Size.px(10)
            )
          })
        )
        .append(
          new Node({
            size: new Rect<Size>(
              Size.px(20),
              Size.px(10)
            )
          })
        );

      compute(node0, space);

      expect(node0.size).toMatchObject(new Rect(40, 10));
    });
  });

  // Item measurement
  describe('when measuring flex items', () => {
    it('should measure definite sized item', () => {
      const node0 = new Node();
      const node1 = new Node({
        size: new Rect<Size>(
          Size.px(30),
          Size.px(25)
        )
      });

      node0.append(node1);

      compute(node0, space);

      expect(node1.size).toMatchObject(new Rect(30, 25));
    });

    it('should measure definite sized item with margin in auto sized container', () => {
      // 80x60px container.
      const node0 = new Node({
        size: SIZE_AUTO.clone()
      });

      const node1 = new Node({
        margin: new Sides(2, 1, 2, 1),
        size: new Rect<Size>(
          Size.px(20),
          Size.px(10)
        )
      });

      node0.append(node1);

      compute(node0, space);

      expect(node0.size).toMatchObject(new Rect(22, 14));
      expect(node1.size).toMatchObject(new Rect(20, 10));
    });

    it('should measure percentage sized item in definite sized container', () => {
      const node0 = new Node({
        size: new Rect<Size>(
          Size.px(80),
          Size.px(40)
        )
      });

      const node1 = new Node({
        size: new Rect<Size>(
          Size.percent(0.75),
          Size.percent(0.25)
        )
      });

      node0.append(node1);

      compute(node0, space);

      expect(node1.size).toMatchObject(new Rect(60, 10));
    });

    it('should measure percentage sized item in percentage sized container', () => {
      // 80x60px container.
      const node0 = new Node({
        size: new Rect<Size>(
          Size.percent(0.8),
          Size.percent(0.6)
        )
      });

      const node1 = new Node({
        size: new Rect<Size>(
          Size.percent(0.3),
          Size.percent(0.2)
        )
      });

      node0.append(node1);

      compute(node0, space);

      expect(node1.size).toMatchObject(new Rect(24, 12));
    });

    it('should measure percentage sized item in auto sized container', () => {
      // 80x60px container.
      const node0 = new Node({
        size: SIZE_AUTO.clone()
      });

      const node1 = new Node({
        size: new Rect<Size>(
          Size.percent(1),
          Size.percent(1)
        )
      });

      node0.append(node1);

      compute(node0, space);

      expect(node1.size).toMatchObject(new Rect(0, 0));
    });

    it('should measure percentage sized content in item with padding', () => {
      const node0 = new Node({
        size: SIZE_FILL.clone()
      });

      const node1 = new Node({
        padding: new Sides(20, 10, 20, 10),
        size: SIZE_FILL.clone()
      });

      const node2 = new Node({
        size: SIZE_HALF.clone()
      });

      node0.append(node1);
      node1.append(node2);

      compute(node0, new Rect(180, 320));

      expect(node1.size).toMatchObject(new Rect(180, 320));
      expect(node2.size).toMatchObject(new Rect(80, 140));
    });

    it.each([
      {
        direction: FlexDirection.Row,
        expected: new Rect(30, 10)
      },
      {
        direction: FlexDirection.Column,
        expected: new Rect(15, 20)
      }
    ])('should measure content sized item with definite sized content', data => {
      // 80x60px container.
      const node0 = new Node({
        size: SIZE_AUTO.clone()
      });

      const node1 = new Node({
        direction: data.direction,
        size: SIZE_AUTO.clone()
      });

      node1
        .append(
          new Node({
            size: new Rect<Size>(
              Size.px(15),
              Size.px(10)
            )
          })
        )
        .append(
          new Node({
            size: new Rect<Size>(
              Size.px(15),
              Size.px(10)
            )
          })
        );

      node0.append(node1);

      compute(node0, space);

      expect(node1.size).toMatchObject(data.expected);
    });
  });

  // Tests related to resolving flexible lengths (flex-grow & flex-shrink).
  describe('when resolving flexible lengths', () => {
    let space: Rect;

    beforeEach(() => {
      space = new Rect(100, 100);
    });

    it.each([
      {
        direction: FlexDirection.Row,
        node1: new Rect(25, 0),
        node2: new Rect(75, 0)
      },
      {
        direction: FlexDirection.Column,
        node1: new Rect(0, 25),
        node2: new Rect(0, 75),
      }
    ])('should grow flex items proportionally with flex-basis: auto', data => {
      const node0 = new Node({
        direction: data.direction,
        size: SIZE_FILL.clone()
      });

      const node1 = new Node({ grow: 1 });
      const node2 = new Node({ grow: 3 });

      node0
        .append(node1)
        .append(node2);

      compute(node0, space);

      expect(node1.size).toMatchObject(data.node1);
      expect(node2.size).toMatchObject(data.node2);
    });

    it.each([
      {
        direction: FlexDirection.Row,
        node1: new Rect(35, 10),
        node2: new Rect(65, 10)
      },
      {
        direction: FlexDirection.Column,
        node1: new Rect(20, 30),
        node2: new Rect(20, 70),
      }
    ])('should grow items proportionally with definite flex-basis', data => {
      const node0 = new Node({
        direction: data.direction,
        size: new Rect<Size>(
          Size.percent(1),
          Size.percent(1)
        )
      });

      const size = new Rect<Size>(
        Size.px(20),
        Size.px(10)
      );

      const node1 = new Node({ grow: 1, size });
      const node2 = new Node({ grow: 3, size });

      node0
        .append(node1)
        .append(node2);

      compute(node0, space);

      expect(node1.size).toMatchObject(data.node1);
      expect(node2.size).toMatchObject(data.node2);
    });

    it.each([
      {
        direction: FlexDirection.Row,
        node1: new Rect(50, 0)
      },
      {
        direction: FlexDirection.Column,
        node1: new Rect(0, 55),
      }
    ])('should properly calculate size of percentage sized content with flex-basis: auto', data => {
      const node0 = new Node({
        grow: 1,
        size: SIZE_AUTO.clone()
      });

      const node1 = new Node({
        size: SIZE_FILL.clone()
      });

      node0.append(node1)

      // Add a fixed node next to node0 to make sure that it grew properly.
      const node2 = new Node({
        size: new Rect<Size>(
          Size.px(30),
          Size.px(25)
        )
      });

      const node3 = new Node({
        direction: data.direction,
        padding: new Sides(10, 10, 10, 10),
        size: SIZE_FILL.clone()
      })
        .append(node0)
        .append(node2);

      compute(node3, space);

      expect(node0.size).toMatchObject(data.node1);
      expect(node1.size).toMatchObject(data.node1);

      // These nodes should have the same size regardless in which direction node3 is laid out.
      expect(node2.size).toMatchObject(new Rect(30, 25));
      expect(node3.size).toMatchObject(new Rect(100, 100));
    });

  });
})


