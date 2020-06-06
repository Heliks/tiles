import { Grid } from "@tiles/engine";

/** A layer that contains tiles structured in a grid. */
export class TileLayer {

  constructor(public readonly grid: Grid) {}

}

/** A layer that contains tiles. */
export class ObjectLayer {}
