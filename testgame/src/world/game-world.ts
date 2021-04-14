import { WorldChunk } from './world-chunk';

export class GameWorld {

  /**
   * All chunks that make up the world. Each chunk is by default unloaded and can be
   * loaded on demand. Chunks can overlap each other, so it is possible that two chunks
   * occupy the same world space.
   */
  public readonly chunks: WorldChunk[] = [];

  /** @internal */
  private _nextChunkId = 0;

  /**
   * Sets a new unloaded chunk.
   *
   * @param file Path to the map file that should be loaded into this chunk.
   * @param width Width of the chunks map file (in units).
   * @param height Height of the chunks map file (in units).
   * @param x Position on x axis where the chunk should spawn its map.
   * @param y Position on y axis where the chunk should spawn its map.
   */
  public setChunk(file: string, width: number, height: number, x = 0, y = 0): WorldChunk {
    const chunk = new WorldChunk(
      ++this._nextChunkId,
      file,
      width,
      height,
      x,
      y
    );

    this.chunks.push(chunk);

    return chunk;
  }

  /**
   * Returns all chunk that are in `range` of the given origin `x` and `y`. The range
   * is projected in all directions which means that a `range` of `5` will effectively
   * have a horizontal and vertical range of `10`.
   */
  public getChunksInRange(x: number, y: number, range = 5, out: WorldChunk[] = []): WorldChunk[] {
    const rx = x - range;
    const ry = y - range;

    const rw = range * 2;
    const rh = range * 2;

    for (const chunk of this.chunks) {
      const cx = chunk.x - (chunk.width / 2);
      const cy = chunk.y - (chunk.height / 2);

      if (
        cx < rx + rw && cx + chunk.width > rx &&
        cy < ry + rh && cy + chunk.height > ry
      ) {
        out.push(chunk);
      }
    }

    return out;
  }

}
