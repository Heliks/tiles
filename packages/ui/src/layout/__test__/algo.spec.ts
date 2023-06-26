import {
  calculateLineCrossSizes,
  collectLines,
  compute,
  determineAvailableSpace,
  determineContainerMainSize,
  setupConstants
} from '../algo';
import { Constants } from '../constants';
import { Line } from '../line';
import { Node } from '../node';
import { Rect } from '../rect';
import { Size } from '../size';
import { AlignContent, FlexDirection } from '../style';


/** @internal */
function setupItemNodes(root: Node, width: number, height: number, amount: number): void {
  for (let i = 0; i < amount; i++) {
    const node = new Node();

    node.size.set(width, height);

    root.add(node);
  }
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
    setupItemNodes(root, 50, 50, test.items);

    // Get the length of each flex line.
    const lines = collectLines(root, test.space);
    const lengths = lines.map(line => line.nodes.length);

    expect(lengths).toEqual(test.lengths);
  });

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

describe('compute', () => {

  it('foo', () => {
    const node = new Node({
      // justify: AlignContent.Center,
      wrap: true,
      size: new Rect<Size>(
        Size.percent(1),
        Size.auto()
      )
    });

    const childA = new Node({
      size: new Rect(
        Size.px(50),
        Size.px(50)
      )
    });

    const childB = new Node({
      size: new Rect(
        Size.px(50),
        Size.px(50)
      )
    })


    node.add(childA);
    node.add(childB);

    compute(node, new Rect(150, 250));

    console.log(node.constants.lines)
    console.log(childA.constants)
    console.log(childB.constants)

  });


});