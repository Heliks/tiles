import { Vec2 } from '@heliks/tiles-engine';
import { Rectangle as PxRect, Texture } from 'pixi.js';
import { SpriteId, SpriteSheet } from './sprite-sheet';


export interface PackedSprite {
  /** Defines the sprites region on the source texture. */
  region: PxRect;
  /** If this sprite is trimmed, contains the original dimensions of the sprite. */
  orig?: PxRect;
}

/**
 * A spritesheet that contains sprites packed together on a single source texture.
 *
 * Sprites can be individually trimmed to further reduce texture size. When a trimmed
 * sprite is created, its texture will restore the original untrimmed size.
 */
export class SpritePack<I extends SpriteId = SpriteId> extends SpriteSheet<I> {

  /** @internal */
  private readonly sprites = new Map<I, PackedSprite>();

  /**
   * @param source Source texture from which sprite textures will be created.
   */
  constructor(public readonly source: Texture) {
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
  public setPackedSprite(spriteId: I, sprite: PackedSprite): this {
    this.sprites.set(spriteId, sprite);

    return this;
  }

  /** @internal */
  private _getPackedSprite(spriteId: I): PackedSprite {
    const sprite = this.sprites.get(spriteId);

    if (! sprite) {
      throw new Error(`PackedSpriteSheet: Invalid Sprite ID ${spriteId}`);
    }

    return sprite;
  }

  /** @inheritDoc */
  protected _texture(spriteId: I): Texture {
    // Todo: getFrame is a hard error which makes this inconsistent with how sprite
    //  grids work. Maybe an empty frame should be used here instead?
    const pack = this._getPackedSprite(spriteId);

    let orig;
    let trim;

    if (pack.orig) {
      orig = new PxRect(0, 0, pack.orig.width, pack.orig.height);
      trim = new PxRect(
        pack.orig.x,
        pack.orig.y,
        pack.region.width,
        pack.region.height
      );
    }

    return new Texture(
      this.source.baseTexture,
      pack.region,
      orig,
      trim
    );
  }

  /** @inheritDoc */
  public getSpriteSize(spriteId: I): Vec2 {
    const packed = this._getPackedSprite(spriteId);

    return new Vec2(
      packed.region.width,
      packed.region.height
    );
  }

}
