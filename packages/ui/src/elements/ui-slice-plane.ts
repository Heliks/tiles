import { Node } from '@heliks/flex';
import { AssetStorage, Handle } from '@heliks/tiles-assets';
import { Entity, World } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { NineSlicePlane, Texture } from 'pixi.js';
import { Element, Postprocess } from '../element';


/**
 * Displays a {@link NineSlicePlane} texture that can be stretched in all directions
 * using 9-slice scaling.
 */
export class UiSlicePlane<I = unknown> implements Element, Postprocess {

  /** @inheritDoc */
  public readonly view = new NineSlicePlane(Texture.WHITE, 0, 0, 0, 0);

  /** Current slice plane texture. */
  private texture?: Texture;

  /**
   * @param spritesheet Spritesheet from which the slice plane texture will be created.
   * @param spriteId Id of the sprite that should be used as the slice plane texture.
   */
  constructor(public spritesheet: Handle<SpriteSheet<I>>, public spriteId: I) {
    // Hide until slice plane texture is ready.
    this.view.visible = false;
  }

  /** @inheritDoc */
  public getContext(): object {
    return this;
  }

  /** @internal */
  private createPlaneTexture(world: World): Texture | undefined {
    const spritesheet = world.get(AssetStorage).get(this.spritesheet);

    if (spritesheet) {
      return this.texture = spritesheet.texture(this.spriteId);
    }
  }

  /** @internal */
  private getPlaneTexture(world: World): Texture | undefined {
    return this.texture ? this.texture : this.createPlaneTexture(world);
  }

  /** Individually sets the offset to each side for the {@link NineSlicePlane}. */
  public side(top: number, right: number, bottom: number, left: number): this {
    this.view.topHeight = top;
    this.view.bottomHeight = bottom;
    this.view.leftWidth = left;
    this.view.rightWidth = right;

    return this;
  }

  /** Sets the offset for all sides of the {@link NineSlicePlane}. */
  public sides(offset: number): this {
    return this.side(offset, offset, offset, offset);
  }

  /** @inheritDoc */
  public update(world: World): void {
    const texture = this.getPlaneTexture(world);

    if (! texture) {
      return;
    }

    this.view.texture = texture;

    // Texture is loaded, therefore sprite can be made visible again.
    this.view.visible = true;
  }

  /** @inheritDoc */
  public postprocess(world: World, entity: Entity, layout: Node): void {
    this.view.width = layout.size.width;
    this.view.height = layout.size.height;
  }

}
