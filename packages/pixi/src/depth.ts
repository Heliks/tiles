export interface DepthSortable {
  x: number;
  y: number;
  height: number;
  width: number;
}

export function depthSort(target: DepthSortable[]) {
  target.sort(
    (a, b) => (a.y + (a.height / 2)) - (b.y + (b.height / 2))
  );
}
