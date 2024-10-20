import { Vec2 } from '@heliks/tiles-engine';
import { Rectangle as PxRectangle, Texture } from 'pixi.js';
import { PackedSprite } from './packed-sprite';
import { SpriteSheet } from './sprite-sheet';


/**
 * A {@link SpriteSheet} that contains sprites packed together to their lowest possible
 * size on a source texture. When sprites are created, their textures are cut from that
 * source texture and their original, unpacked size will be restored.
 */
export class PackedSpriteSheet extends SpriteSheet<number> {

  /** @internal */
  private readonly sprites = new Map<number, PackedSprite>();

  /**
   * @param source Source texture from which sprite textures will be created.
   */
  constructor(private readonly source: Texture) {
    super();
  }

  /** @inheritDoc */
  public size(): number {
    return this.sprites.size;
  }

  /**
   * Registers a packed `sprite` using the given `spriteId`. The packed sprite will be
   * un-packed when it is created via `sprite()` or `texture()`.
   *
   * @see sprite()
   * @see texture()
   */
  public setPackedSprite(spriteId: number, sprite: PackedSprite): this {
    this.sprites.set(spriteId, sprite);

    return this;
  }

  /** @internal */
  private _getPackedSprite(spriteId: number): PackedSprite {
    const sprite = this.sprites.get(spriteId);

    if (! sprite) {
      throw new Error(`PackedSpriteSheet: Invalid Sprite ID ${spriteId}`);
    }

    return sprite;
  }

  /** @inheritDoc */
  protected _texture(spriteId: number): Texture {
    // Todo: getFrame is a hard error which makes this inconsistent with how sprite
    //  grids work. Maybe an empty frame should be used here instead?
    const frame = this._getPackedSprite(spriteId);

    return new Texture(
      this.source.baseTexture,
      frame,
      new PxRectangle(
        0,
        0,
        frame.source.width,
        frame.source.height
      ),
      new PxRectangle(
        frame.source.x,
        frame.source.y,
        frame.width,
        frame.height
      )
    );
  }

  /** @inheritDoc */
  public getSpriteSize(spriteId: number): Vec2 {
    const packed = this._getPackedSprite(spriteId);

    return new Vec2(
      packed.width,
      packed.height
    );
  }

}
