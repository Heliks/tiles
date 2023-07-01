/** Contains information about custom properties of a tile. */
export class CustomTile<P> {

  /**
   * @param index Index that the tile occupies on the tileset.
   * @param props Custom properties.
   */
  constructor(public readonly index: number, public readonly props: P) {}

}