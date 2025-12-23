export class LevelConfig {

  /**
   * Defines the number of chunks that will be rendered in each direction from the
   * current camera position.
   */
  public renderDistance = 2;

  /**
   * Defines the number of chunks in each direction from the current camera position
   * that remain once they're loaded. If a chunk is outside this distance, it will
   * be unloaded automatically.
   */
  public unloadDistance = 4;

}
