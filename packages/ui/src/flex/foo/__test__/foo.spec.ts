import { FlexDirection, Style, StyleProperties } from '../style';
import { Box, FlexContainer } from '../box';
import { percent, pixels, Size, SizeUnit, toPixels } from '../size';
import { Struct } from '@heliks/tiles-engine';




export class Layout {

  /** Width in px. */
  public width = 0;

  /** Height in px. */
  public height = 0;

  // public contentSize = new Box(0, 0);

  public readonly suggestions = {
    contentSize: new FlexContainer()
  };

  public readonly contentSize = new FlexContainer();
  public readonly position = new FlexContainer();

  public x = 0;
  public y = 0;

  /**
   * Width and height constrains in pixels. Basically the
   * total available space that child nodes can take.
   */
  public readonly constraints = new Box();

  public readonly constraints2 = new FlexContainer();

  public readonly size = new Box();

  /**
   *
   */
  public readonly available = new FlexContainer();

}

function isRowFlow(style: Style): boolean {
  return style.direction === FlexDirection.Row;
}

function getMainAxisConstraint(style: Style): Size {
  return isRowFlow(style) ? style.width : style.height;
}

function getCrossAxisConstraint(style: Style): Size {
  return isRowFlow(style) ? style.height : style.width;
}


export type SizeKey = 'width' | 'height';


export class Node {

  public readonly children: Node[] = [];

  /**
   * Contains the computed layout.
   */
  public readonly layout = new Layout();

  public readonly style: Style;


  constructor(style?: Partial<StyleProperties>) {
    this.style = new Style(style);
  }

  public add(node: Node): this {
    this.children.push(node);

    return this;
  }

  public child(style?: Partial<StyleProperties>): Node {
    const node = new Node(style);

    this.add(node);

    return node;
  }

  private computeSize(space: Box): void {

    // height
    if (this.style.height.unit === SizeUnit.Auto) {
      // this.layout.height = space.height;
    }
    else {
      this.layout.height = toPixels(this.style.height, space.height);
    }
  }

  private inner = new Box(0, 0);

  public isRow(): boolean {
    return this.style.direction === FlexDirection.Row;
  }

  public isCol(): boolean {
    return this.style.direction === FlexDirection.Column;
  }

  public getMainAxisConstraint(): Size {
    return this.style[this.keys.main];
  }

  public getCrossAxisConstraint(): Size {
    return this.style[this.keys.cross];
  }

  /**
   * Maps both flex container axes to either 'width' or 'height' as a string. This is
   * used internally to quickly access the style property relevant for a certain flex
   * axis. Do not modify this directly.
   *
   * @internal
   */
  private readonly keys: Struct<SizeKey> = {
    main: 'width',
    cross: 'height'
  }

  /** @internal */
  private setKeys(): void {
    if (this.isRow()) {
      this.keys.main = 'width';
      this.keys.cross = 'height';
    }
    else {
      this.keys.main = 'height';
      this.keys.cross = 'width';
    }
  }

  /**
   * Computes the {@link space inner space} of the layout from a pixel `space`.
   *
   * @internal
   */
  private computeSizeConstraints(space: Box): void {
    const m = space[this.keys.main];
    const c = space[this.keys.cross];

    this.layout.constraints2.main = m;
    this.layout.constraints2.cross = c;

    this.layout.constraints[this.keys.main] = toPixels(this.getMainAxisConstraint(), space.width);
    this.layout.constraints[this.keys.cross] = toPixels(this.getCrossAxisConstraint(), space.height);
  }

  private getMainAxisSize(used: number) {
    return this.getMainAxisConstraint().unit === SizeUnit.Auto ? used : this.layout.constraints[this.keys.main];
  }

  public compute(space: Box) {
    this.setKeys();

    this.computeSizeConstraints(space);

    // this.layout.available.copy(this.layout.constraints)

    let used = 0;

    for (const child of this.children) {
      child.compute(this.layout.constraints);

      used += child.layout.size[this.keys.main];
    }

    // Note: Since there is currently no flex-basis, all items are sized under their
    // size constraints. See: https://www.w3.org/TR/css-flexbox-1/#algo-main-item (D).
    const main = this.getMainAxisSize(used);
    const cross = this.layout.constraints[this.keys.cross];

    this.layout.size[this.keys.main] = main;
    this.layout.size[this.keys.cross] = cross;







    /*
    const maxContent = new FlexContainer(
      space.width,
      space.height
    );

    // Accumulation of all min-content contributions of child nodes.
    const minContent = new FlexContainer(0, 0);

    const available = new FlexContainer(
      space.width,
      space.height
    );

    for (const child of this.children) {
      child.layout.contentSize.main = toPixels(child.style.getMainAxisSize(), available.main);
      child.layout.contentSize.cross = toPixels(child.style.getCrossAxisSize(), available.cross);

      minContent.main += child.layout.contentSize.main;

      child.layout.position.main = minContent.main;

      available.sub(child.layout.contentSize);
    }

    if (this.style.getMainAxisSize().unit === SizeUnit.Auto) {
      this.layout.contentSize.main = minContent.main;
    }

    if (this.style.getCrossAxisSize().unit === SizeUnit.Auto) {
      this.layout.contentSize.cross = minContent.cross;
    }


    // this.layout.contentSize.copy(minContent);


    /*
    this.layout.height = toPixels(this.style.height, space.height);
    this.layout.width = toPixels(this.style.width, space.width);

    this.layout.suggestions.contentSize.reset();

    for (const child of this.children) {
      child.compute(this.layout);

      child.layout.x = this.layout.suggestions.contentSize.main;

      this.layout.suggestions.contentSize.main += child.layout.width;
    }

    if (this.style.width.unit === SizeUnit.Auto) {
      this.layout.width = this.layout.suggestions.contentSize.main;
    }

    if (this.style.height.unit === SizeUnit.Auto) {
      this.layout.height = this.layout.suggestions.contentSize.cross;
    }
     */


    // this.layout.width = this.style.width.toPx(space.width);
    // this.layout.height = this.style.height.toPx(space.height);
  }

}

describe('Layout', () => {

  it.each([
    {
      expected: new Box(800, 500),
      style: {}
    },
    {
      expected: new Box(400, 250),
      style: {
        width: percent(0.5),
        height: percent(0.5)
      }
    },
    {
      expected: new Box(200, 100),
      style: {
        width: pixels(200),
        height: pixels(100)
      }
    },
    {
      expected: new Box(500, 800),
      style: {
        direction: FlexDirection.Column
      }
    },
    {
      expected: new Box(250, 400),
      style: {
        direction: FlexDirection.Column,
        width: percent(0.5),
        height: percent(0.5)
      }
    }
  ])('should compute size constraints', data => {
    const node = new Node(data.style);

    node.compute({
      width: 800,
      height: 500
    });

    expect(node.layout.constraints).toMatchObject(data.expected);
  });

  it('should compute auto size from space used by flex items', () => {
    const node = new Node()
      .add(
        // Total main axis width is 550px.
        new Node()
          .add(
            new Node({
              width: percent(0.5)
            })
          )
          .add(
            new Node({
              width: pixels(50)
            })
          )
      )
      .add(
        // Total main axis width is 100px.
        new Node({
          width: pixels(200)
        })
      );

    node.compute({
      width: 1000,
      height: 1000
    });

    expect(node.layout.size.width).toBe(750);
    expect(node.layout.size.height).toBe(1000);
  });

  /*
  it.each([

  ])('should compute size of flex items', () => {

  });

   */


  /*
  describe('when computing layout', () => {

    it.each([
      {
        size: {
          width: pixels(100),
          height: pixels(100)
        },
        expected: {
          width: 100,
          height: 100
        }
      },
      {
        size: {
          width: percent(0.75),
          height: percent(0.50)
        },
        expected: {
          width: 600,
          height: 250
        }
      }
    ])('should compute layout size on a 800x500px wide space', (data) => {
      const node = new Node({
        width: data.contentSize.width,
        height: data.contentSize.height
      });

      node.compute({
        width: 800,
        height: 500
      });

      expect(node.layout).toMatchObject(data.expected);
    });

    it('should compute the size of an auto sized node with a single child', () => {
      const root = new Node({
        width: auto(),
        height: auto()
      });

      // Add 500x500px leaf node.
      root
        .add(
          new Node({
            width: pixels(50),
            height: pixels(50)
          })
        )
        .add(
          new Node({
            width: pixels(100)
          })
        );

      root.compute({
        width: 800,
        height: 500
      });

      expect(root.layout).toMatchObject({
        width: 150,
        height: 500
      });
    });
  });
   */

});
