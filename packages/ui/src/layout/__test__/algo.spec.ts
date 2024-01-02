import { Vec2 } from '@heliks/tiles-engine';
import {
  calculateLineCrossSizes,
  calculateOuterNodeSize,
  collectLines,
  compute,
  determineAvailableSpace,
  determineContainerMainSize,
  distributeAvailableSpace,
  setupConstants
} from '../algo';
import { Constants } from '../constants';
import { Line } from '../line';
import { Node } from '../node';
import { Rect } from '../rect';
import { Sides } from '../sides';
import { Size } from '../size';
import { FlexDirection, isRow, Style } from '../style';


/** @internal */
function setupItemNodes(root: Node, width: number, height: number, amount: number): void {
  for (let i = 0; i < amount; i++) {
    const node = new Node();

    node.size.set(width, height);

    root.add(node);
  }
}

function createTestNode(width: number, height: number, style: Partial<Style> = {}): Node {
  const node = new Node({
    size: new Rect(Size.px(width), Size.px(height)),
    ...style
  });

  setupConstants(node);

  node.size.width = width;
  node.size.height = height;

  calculateOuterNodeSize(node);

  return node;
}

describe('determineAvailableSpace()', () => {
  it('should determine available space from definite sized container', () => {
    const node = new Node({
      size: new Rect(
        Size.px(50),
        Size.px(25)
      )
    });

    const space = new Rect(200, 100);

    determineAvailableSpace(node, space);

    expect(node.constants.space).toMatchObject(new Rect(50, 25));
  });

  it('should determine available space from auto sized container', () => {
    const node = new Node();
    const space = new Rect(200, 100);

    determineAvailableSpace(node, space);

    expect(node.constants.space).toMatchObject(space);
  });

  it('should take container margin into account', () => {
    const node = new Node({
      margin: new Sides(10, 5, 10, 5)
    });

    // Sums horizontal & vertical margins.
    setupConstants(node);
    determineAvailableSpace(node, new Rect(200, 200));

    expect(node.constants.space).toMatchObject(new Rect(190, 180));
  });

  it('should take container padding into account', () => {
    const node = new Node({
      padding: new Sides(5, 10, 15, 20)
    });

    // Sums horizontal & vertical margins.
    setupConstants(node);
    determineAvailableSpace(node, new Rect(200, 200));

    expect(node.constants.space).toMatchObject(new Rect(170, 180));
  });
});

describe('collectLines()', () => {
  it('should add nodes to lines', () => {
    const childA = new Node();
    const childB = new Node();

    const root = new Node()
      .add(childA)
      .add(childB);

    const lines = collectLines(root, new Rect(100, 100));
    const nodes = lines[0]?.nodes;

    expect(nodes).toEqual([
      childA,
      childB
    ]);
  });

  it.each([
    {
      space: new Rect(100, 100)
    },
    {
      space: new Rect(50, 50)
    },
  ])('should collect items into a single line', test => {
    const root = new Node();

    const node1 = new Node();
    const node2 = new Node();

    node1.size.set(50, 50);
    node2.size.set(50, 50);

    // Add 2 nodes, each measured 50x50px.
    root.add(node1);
    root.add(node2);

    const lines = collectLines(root, test.space);

    expect(lines.length).toBe(1);
  });

  it.each([
    {
      direction: FlexDirection.Row,
      items: 2,
      lengths: [2],
      space: new Rect(100, 100)
    },
    {
      direction: FlexDirection.Row,
      items: 7,
      lengths: [2, 2, 2, 1],
      space: new Rect(100, 100)
    },
    {
      direction: FlexDirection.Column,
      items: 5,
      lengths: [4, 1],
      space: new Rect(100, 200)
    },
    {
      direction: FlexDirection.Row,
      items: 4,
      lengths: [3, 1],
      space: new Rect(180, 100)
    }
  ])('should collect items into multiple lines', test => {
    const root = new Node({
      direction: test.direction,
      wrap: true
    });

    setupConstants(root);

    for (let i = 0; i < test.items; i++) {
      root.add(createTestNode(50, 50));
    }

    // Get the length of each flex line.
    const lines = collectLines(root, test.space);
    const lengths = lines.map(line => line.nodes.length);

    expect(lengths).toEqual(test.lengths);
  });

  it('should take outer size into account when collecting the flex line', () => {
    const node = new Node({
      wrap: true
    });

    setupConstants(node);

    // Create three nodes. Based on their defined size they should all fit into the
    // same line. However, with a margin applied, their outer size grows where only
    // two items should fit into the same line.
    node.add(createTestNode(25, 25, { margin: new Sides(0, 0, 0, 5) }));
    node.add(createTestNode(25, 25, { margin: new Sides(0, 0, 0, 5) }));
    node.add(createTestNode(25, 25, { margin: new Sides(0, 0, 0, 5) }));

    const lines = collectLines(node, new Rect(75, 75));

    expect(lines).toHaveLength(2);
  });

  /*
  it.each([
    {
      direction: FlexDirection.Row,
      size: new Rect(250, 25)
    },
    {
      direction: FlexDirection.Column,
      size: new Rect(50, 125)
    }
  ])('should calculate size of collected lines', test => {
    const root = new Node({
      direction: test.direction
    });

    setupConstants(root);
    setupItemNodes(root, 50, 25, 5);

    const lines = collectLines(root, new Rect(500, 500));
    const line = lines[0];

    expect(line.size).toMatchObject(test.size);
  });
   */
});

describe('determineContainerMainSize()', () => {
  it.each([
    {
      result: 300,
      lines: [
        100,
        300,
        200
      ]
    },
    {
      result: 100,
      lines: [
        100
      ]
    }
  ])('should determine container main size', test => {
    const constants = new Constants();

    // Create a line.
    for (const main of test.lines) {
      const line = new Line();

      line.size.setMain(constants.isRow, main);

      constants.lines.push(line);
    }

    const main = determineContainerMainSize(constants.lines, constants);

    // Sanity: Make sure we got a line for every entry in the test object.
    expect(constants.lines).toHaveLength(test.lines.length);

    // Actual test assertion.
    expect(main).toBe(test.result);
  });
});

describe('calculateLineCrossSizes()', () => {
  it('should set cross size to container size if container is single line', () => {
    const constants = new Constants();
    const line = new Line();

    constants.size.width = 25;
    constants.size.height = 50;
    constants.lines.push(line);

    calculateLineCrossSizes(constants);

    const cross = line.size.cross(constants.isRow);

    expect(cross).toBe(50);
  });
});

describe('calculateOuterSize()', () => {
  it('should compute the outer size of a node', () => {
    const node = new Node();

    node.size.width = 10;
    node.size.height = 20;

    const outer = calculateOuterNodeSize(node);

    expect(outer).toMatchObject({
      width: 10,
      height: 20
    });
  });

  it('should take margin into account', () => {
    const node = new Node({
      margin: new Sides(1, 2, 3, 4)
    });

    node.size.width = 10;
    node.size.height = 20;

    setupConstants(node);

    const outer = calculateOuterNodeSize(node);

    expect(outer).toMatchObject({
      width: 16,
      height: 24
    });
  });

});

describe('distributeAvailableSpace()', () => {
  let constants: Constants;
  let line: Line;

  beforeEach(() => {
    constants = new Constants();
    line = new Line();
  });

  it.each([
    {
      direction: FlexDirection.Row,
      positions: {
        childA: new Vec2(0, 0),
        childB: new Vec2(25, 0)
      }
    },
    {
      direction: FlexDirection.Column,
      positions: {
        childA: new Vec2(0, 0),
        childB: new Vec2(0, 25)
      }
    }
  ])('should distribute space in flex direction $direction', data => {
    const childA = createTestNode(25, 25);
    const childB = createTestNode(25, 25);

    line
      .add(childA)
      .add(childB);

    constants.isRow = isRow(data.direction)

    distributeAvailableSpace([ line ], new Rect(200, 200), constants);

    expect(childA.pos).toMatchObject(data.positions.childA);
    expect(childB.pos).toMatchObject(data.positions.childB);
  });

  it('should distribute margins for column layouts', () => {
    const childA = createTestNode(25, 25, {
      margin: new Sides(5, 5, 5, 5)
    });

    const childB = createTestNode(25, 25, {
      margin: new Sides(0, 0, 0, 5)
    });

    const space = new Rect(200, 200);

    // compute children to determine their inner & outer sizes.
    compute(childA, space);
    compute(childB, space);

    line.add(childA).add(childB);

    constants.isRow = true;

    distributeAvailableSpace([ line ], new Rect(200, 200), constants);

    expect(childA.pos).toMatchObject(new Vec2(5, 5));
    expect(childB.pos).toMatchObject(new Vec2(40, 0));
  });

  it('should take padding of flex container into account', () => {
    constants.padding.copy(new Sides(5, 0, 0, 10));

    const child = createTestNode(10, 10);
    const space = new Rect(100, 100);

    line.add(child);

    distributeAvailableSpace([ line ], space, constants);

    expect(child.pos).toMatchObject(new Vec2(10, 5));
  });
});


/*
describe('compute', () => {
  it('foo', () => {
    const container = new Node({
      // justify: AlignContent.Center,
      // wrap: true,
      size: new Rect<Size>(
        Size.percent(1),
        Size.percent(1)
      )
    });

    const outer = new Node({
      direction: FlexDirection.Row
    });

    for (let i = 0; i < 2; i++) {
      const wrapper = new Node({
        direction: FlexDirection.Column,
        margin: new Sides(0, 5, 0, 5)
      });

      const childA = new Node({ size: new Rect(Size.px(32), Size.px(32)) });
      const childB = new Node({ size: new Rect(Size.px(32), Size.px(32)) });

      wrapper.add(childA);
      wrapper.add(childB);

      outer.add(wrapper);
    }

    container.add(outer);

    compute(container, new Rect(180, 320));

    // console.log(outer.children[0].children[0].pos)
    // console.log(outer.children[1].children[1].pos)
  });
});

 */