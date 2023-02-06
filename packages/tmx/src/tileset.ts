import { Align, SpriteAnimation, SpriteAnimationData, SpriteGrid } from '@heliks/tiles-pixi';
import { Tileset as Base } from '@heliks/tiles-tilemap';
import { Properties } from './properties';
import { Shape } from './shape';


/** @internal */
function getTileAnimationName(tileId: number): string {
  return `tile-${tileId}-default`;
}

/** @inheritDoc */
export class Tileset extends Base {

  /**
   * Objects that use sprites from this tileset should be aligned to this alignment
   * position. This also includes {@link shapes} that are placed on tiles of this
   * tileset. The Tiled default is the bottom-left corner.
   */
  public align = Align.BottomLeft;

  /** Contains custom properties associated with a certain tile ID. */
  public readonly tileProperties = new Map<number, Properties>();

  /** Contains tile shapes, mapped to the tileId to which they belong. */
  private readonly shapes = new Map<number, Shape[]>();

  /**
   * Returns a `SpriteAnimation` for the given tile, if any.
   *
   * @see SpriteAnimation
   */
  public getAnimation(tileId: number): SpriteAnimation | undefined {
    const animation = getTileAnimationName(tileId);

    if (this.spritesheet.hasAnimation(animation)) {
      return this.spritesheet.createAnimation(animation);
    }
  }

  /**
   * Registers an `animation` for the tile matching `tileId`. A `SpriteAnimation`
   * component can be retrieved via `getAnimation()`,
   *
   * @see SpriteAnimation
   */
  public setAnimation(tileId: number, animation: SpriteAnimationData): this {
    this.spritesheet.setAnimation(getTileAnimationName(tileId), animation);

    return this;
  }

  /**
   * Returns all shapes that belong to the tile matching `tileId`. Returns `undefined`
   * if that tile does not have any shapes.
   */
  public getTileShapes(tileId: number): Shape[] | undefined {
    return this.shapes.get(tileId);
  }

  /**
   * Assigns shapes to the tile matching `id`. This overwrites any shapes that were
   * previously assigned to that tile.
   */
  public setTileShapes(tileId: number, shapes: Shape[]): this {
    this.shapes.set(tileId, shapes);

    return this;
  }

  /**
   * Returns the custom properties associated with the tile matching `tileId`, if any.
   *
   * @typeparam P Expected format of the tile properties. This is not type safe.
   */
  public getTileProperties<P extends Properties>(tileId: number): P | undefined {
    return this.tileProperties.get(tileId) as P;
  }

}
