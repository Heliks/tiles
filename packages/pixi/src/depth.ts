import { StageNode } from './stage';

/** An object that can be depth sorted. */
export interface DepthSortable {
  x: number;
  y: number;
  height: number;
  width: number;
}

/**
 * Depth sorts the given `target`. E.g. children with a higher bottom-center aligned
 * position will come first.
 */
export function depthSort(target: DepthSortable[]): void {
  target.sort((a, b) => (a.y + (a.height / 2)) - (b.y + (b.height / 2)));
}

/** Sorts children based on the y position of the bottom of the child. */
export class SortNode extends StageNode {

  /** @inheritDoc */
  public update(): void {
    depthSort(this.children);
  }

}