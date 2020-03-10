import { ProcessingSystem, Transform, World } from '@tiles/engine';
import { Query } from '@tiles/entity-system';
import { Injectable } from '@tiles/injector';
import { Sprite } from 'pixi.js';
import { Renderer } from '../renderer';
import { Stage } from '../stage';
import { cropTexture } from '../utils';
import { SpriteDisplay } from './sprite-display';

@Injectable()
export class SpriteRenderer extends ProcessingSystem {

  /** Contains sprites mapped to the display to which they belong. */
  protected sprites = new WeakMap<SpriteDisplay, Sprite>();

  constructor(
    public readonly renderer: Renderer,
    public readonly stage: Stage
  ) {
    super();
  }

  /** {@inheritDoc} */
  public getQuery(): Query {
    return {
      contains: [
        SpriteDisplay,
        Transform
      ]
    };
  }

  /** todo */
  protected sprite(display: SpriteDisplay): Sprite {
    let sprite = this.sprites.get(display);

    if (sprite) {
      return sprite;
    }

    sprite = new Sprite();

    this.sprites.set(display, sprite);
    this.stage.addChild(sprite);

    return sprite;
  }

  /** {@inheritDoc} */
  public update(world: World): void {
    const $display = world.storage(SpriteDisplay);
    const $trans = world.storage(Transform);

    for (const entity of this.group.entities) {
      const display = $display.get(entity);
      const sprite  = this.sprite(display);

      if (display.dirty) {
        const image = this.renderer.textures.get(display.sheet.image);

        if (image) {
          // Remove flag before the update is complete so we don't accidentally
          // attempt to re-render the sprite more than once.
          display.dirty = false;

          // Update display sprite with new texture.
          sprite.texture = cropTexture(
            image.data,
            display.sheet.pos(display.id),
            display.sheet.getSpriteSize()
          );
        }
      }

      // Update the sprites position.
      const trans = $trans.get(entity);

      sprite.x = trans.x;
      sprite.y = trans.y;
    }
  }

}
