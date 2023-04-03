import { Vec2 } from '@heliks/tiles-engine';
import { Style } from './style';
import { Box } from './box';


export class Layout {

  /** Width in px. */
  public width = 0;

  /** Height in px. */
  public height = 0;

  /** Position in px relative to its parent. */
  public local = new Vec2();

}


export class Node {

  public readonly children: Node[] = [];

  /**
   * Contains the computed layout.
   */
  public readonly layout = new Layout();

  constructor(public readonly style: Style) {}

  public compute(space: Box) {

  }

}

