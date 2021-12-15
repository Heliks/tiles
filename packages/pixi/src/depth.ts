/** @internal */
interface Sortable {
  x: number;
  y: number;
  height: number;
  width: number;
}

/**
 * Depth sorts the given array of `rectangles`. E.g. Rectangles with a higher bottom-
 * center aligned position will come first.
 */
export function depthSort(rectangles: Sortable[]): void {
  rectangles.sort((a, b) => (a.y + (a.height / 2)) - (b.y + (b.height / 2)));
}
