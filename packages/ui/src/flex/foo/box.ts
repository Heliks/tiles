import { Size } from '../size';


export class Box {

  constructor(public width = 0, public height = 0) {}


}

/**
 * Internal representation of a flexbox. The layout of a flex container depends on a flex
 * {@link FlexDirection direction}. We differentiate between a main axis and a cross axis,
 * where each can either be the width or the height of a box, depending on its direction.
 */
export class FlexContainer {

  /**
   * @param main
   * @param cross
   */
  constructor(public main = 0, public cross = 0) {}

  public sub(box: FlexContainer): this {
    this.main -= box.main;
    this.cross -= box.cross;

    return this;
  }

  public copy(box: FlexContainer): this {
    this.main = box.main;
    this.cross = box.cross;

    return this;
  }

  public reset(): this {
    this.main = 0;
    this.cross = 0;

    return this;
  }

}
