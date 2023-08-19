import { Vec2 } from '@heliks/tiles-engine';
import { Constants } from './constants';
import { Rect } from './rect';
import { Size } from './size';
import { computeStyleSheet, Style } from './style';

let id = 0;

/**
 *
 */
export class Node {

  public id = 0;

  /** Other {@link Node nodes} that are direct children of this one. */
  public readonly children: Node[] = [];

  /**
   * Constants used for internal layout computation. Do not edit manually.
   *
   * @internal
   */
  public readonly constants = new Constants();

  /** Definite computed size. */
  public readonly size = new Rect(0, 0);

  /** Definite computed position. */
  public readonly pos = new Vec2();

  /** Contains the nodes {@link Style stylesheet}. */
  public style: Style;

  /**
   * @param style Styles that should be applied to the node. Missing style properties
   *  will be filled with computed default values.
   */
  constructor(style: Partial<Style> = {}) {
    this.id = ++id;
    this.style = computeStyleSheet(style);
  }

  public add(node: Node): this {
    this.children.push(node);

    return this;
  }

  public remove(node: Node): this {
    const index = this.children.indexOf(node);

    if (~index) {
      this.children.splice(index, 1);
    }

    return this;
  }

  public static rect(width: Size, height: Size): Node {
    return new Node({
      size: new Rect(width, height)
    });
  }

}
