import { Rectangle, Vec2 } from '@heliks/tiles-engine';
import { Texture, Rectangle as PixRectangle } from 'pixi.js';
import { SpriteSheet } from './sprite-sheet';


/** Unique ID of a sprite slice. */
export type SliceId = string;

/**
 * A {@link SpriteSheet} that contains multiple inconsistently sized sprites packed into
 * a single source texture.
 *
 * Individual sprites are defined by a {@link Rectangle slice region} and sliced from
 * the source texture when they are created.
 *
 * ```ts
 * const region = new SliceRegion(texture);
 *
 * // Defines a sprite at x: 10 y: 10 with a size of w: 25 and h: 25 on the original
 * // spritesheet texture.
 * region.setSliceRegion('foo', new Rectangle(10, 10, 25, 25));
 *
 * // Cut the slice from the source texture.
 * const texture = region.texture('foo');
 * ``
 */
export class SpriteSlices extends SpriteSheet<SliceId> {

  /** Contains all registered slice regions, mapped to their {@link SliceId}. */
  public readonly slices = new Map<SliceId, Rectangle>();

  /**
   * @param source Source texture from which sprite textures will be created.
   */
  constructor(public readonly source: Texture) {
    super();
  }

  /** @inheritDoc */
  public size(): number {
    return this.slices.size;
  }

  /** Defines a slice region. */
  public setSliceRegion(id: SliceId, region: Rectangle): void {
    this.slices.set(id, region);
  }

  /** Returns the slice region matching `id`. Throws if no such slice exists. */
  public getSliceRegion(id: SliceId): Rectangle {
    const slice = this.slices.get(id);

    if (! slice) {
      throw new Error(`Invalid slice ${id}`);
    }

    return slice;
  }

  /** @inheritDoc */
  protected _texture(id: SliceId): Texture {
    const region = this.getSliceRegion(id);

    return new Texture(this.source.baseTexture, new PixRectangle(
      region.width,
      region.height,
      region.x,
      region.x
    ));
  }

  /** @inheritDoc */
  public getSpriteSize(id: SliceId): Vec2 {
    const region = this.getSliceRegion(id);

    return new Vec2(
      region.width,
      region.height
    );
  }

}