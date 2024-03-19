import { Node } from './node';
import { Rect } from './rect';


export class Line {

  /** All {@link Node nodes} that are part of this line. */
  public readonly nodes: Node[] = [];

  public readonly unfrozen: Node[] = [];

  /** Computed size. */
  public readonly size = new Rect(0, 0);

  /** Adds a {@link Node node} to this line. */
  public add(node: Node): this {
    this.nodes.push(node);

    return this;
  }

  /** Resets the line to its initial state. */
  public reset(): void {
    this.size.width = 0;
    this.size.height = 0;

    this.nodes.length = 0;
    this.unfrozen.length = 0;
  }

}
