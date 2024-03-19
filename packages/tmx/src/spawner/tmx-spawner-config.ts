/** Resource that contains the configuration for the TMX map spawner. */
export class TmxSpawnerConfig {

  /**
   * @param unitSize Amount of pixels that are treated as one in-game unit by the
   *  spawner. If physics are used it is highly recommended to work with small numbers,
   *  hence why pixels should be converted to an arbitrary unit of measurement.
   *
   *  For example, using a unit size of `16`, an object that is placed at the position
   *  x: 32 y: 32 in the tiled editor, will have that position converted to a world
   *  position of x: 2 y: 2.
   */
  constructor(public readonly unitSize = 1) {}

}

