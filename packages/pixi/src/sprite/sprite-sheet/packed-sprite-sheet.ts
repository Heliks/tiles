import { Rectangle as PxRectangle, Sprite, Texture } from 'pixi.js';
import { PackedSprite } from './packed-sprite';
import { SpriteSheet } from './sprite-sheet';


/**
 * A packed sprite sheet is a single texture that contains multiple different sized
 * sprites, where each sprite is trimmed (packed) to its lowest possible width and
 * height. When a texture is created for a sprite, the original, "un-packed" size of
 * the sprite is restored.
 */
export class PackedSpriteSheet extends SpriteSheet {

  /** @internal */
  private readonly sprites = new Map<number, PackedSprite>();

  /** Cache for created textures. */
  private readonly textures = new Map<number, Texture>()

  /**
   * @param tex Texture from which sprites will be created.
   */
  constructor(private readonly tex: Texture) {
    super();
  }

  /** @inheritDoc */
  public size(): number {
    return this.sprites.size;
  }

  /** @inheritDoc */
  public sprite(index: number): Sprite {
    return new Sprite(this.texture(index));
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
  public texture(spriteId: number): Texture {
    let texture = this.textures.get(spriteId);

    if (texture) {
      return texture;
    }

    // Todo: getFrame is a hard error which makes this inconsistent with how sprite
    //  grids work. Maybe an empty frame should be used here instead?
    const frame = this._getPackedSprite(spriteId);

    texture = new Texture(
      this.tex.baseTexture,
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

    this.textures.set(spriteId, texture);

    return texture;
  }

}
