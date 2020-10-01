import { Sprite, SpriteSheet } from '@heliks/tiles-pixi';

export class Tileset {

  /**
   * Contains the last ID in the global ID range that the tileset is occupying on a
   * maps global range.
   */
  public get lastId(): number {
    return this.firstId + this.spritesheet.size() - 1;
  }

  /**
   * @param spritesheet Spritesheet for rendering individual sprites.
   * @param firstId First ID in the global ID range of the map that this tileset occupies.
   */
  constructor(
    public readonly spritesheet: SpriteSheet,
    public readonly firstId: number
  ) {}

  /**
   * Converts `id` to its local counterpart on [[tileset]]. For example if [[firstId]]
   * is `12` this function will return the local ID `3` when given a global ID of `15`.
   */
  public toLocal(id: number): number {
    return id - this.firstId + 1;
  }

  /** Creates a sprite from the given global `id`. */
  public sprite(id: number): Sprite {
    return this.spritesheet.sprite(this.toLocal(id) - 1);
  }

}

