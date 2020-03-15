import { ProcessingSystem, Transform, World } from '@tiles/engine';
import { Query } from '@tiles/entity-system';
import { Injectable } from '@tiles/injector';
import { AnimatedSprite, Sprite } from 'pixi.js';
import { Renderer } from '../renderer';
import { Stage } from '../stage';
import { cropTexture } from '../utils';
import { SpriteAnimation, SpriteDisplay } from './sprite-display';
import { SpriteSheet } from "./sprite-sheet";

/** Returns true if the sprite is an animation. */
export function isAnimated(sprite: unknown): sprite is SpriteAnimation {
  return typeof sprite === 'object';
}

@Injectable()
export class SpriteRenderer extends ProcessingSystem {

  /** Contains sprites mapped to the display to which they belong. */
  protected sprites = new WeakMap<SpriteDisplay, Sprite>();

  /**
   * @param renderer [[Renderer]]
   * @param stage [[Stage]]
   */
  constructor(public readonly renderer: Renderer, public readonly stage: Stage) {
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

  /**
   * Renders a sprite `animation`.
   *
   * @param animation Animation data.
   * @param sheet The sprite-sheet used to create textures for the animation.
   * @returns An animated sprite.
   */
  public renderAnimatedSprite(animation: SpriteAnimation, sheet: SpriteSheet): AnimatedSprite {
    const texture = this.renderer.textures.get(sheet.image) as any;

    // Get all textures that are required for the animation.
    const textures = animation.frames.map(
      item => cropTexture(texture.data, sheet.pos(item), sheet.getSpriteSize())
    );

    const sprite = new AnimatedSprite(textures);

    // Apply animation speed.
    if (animation.speed) {
      sprite.animationSpeed = animation.speed;
    }

    return sprite;
  }

  /**
   * Renders the sprite matching `id`.
   *
   * @param spriteId Id on `sheet` of the sprite that should be rendered.
   * @param sheet The sprite-sheet used to create textures for the animation.
   * @returns A static sprite.
   */
  public renderStaticSprite(spriteId: number, sheet: SpriteSheet): Sprite {
    const texture = this.renderer.textures.get(sheet.image) as any;

    const sprite = new Sprite();

    sprite.texture = cropTexture(
      texture.data,
      sheet.pos(spriteId),
      sheet.getSpriteSize()
    );

    return sprite;
  }

  /** {@inheritDoc} */
  public update(world: World): void {
    const $display = world.storage(SpriteDisplay);
    const $trans   = world.storage(Transform);

    for (const entity of this.group.entities) {
      const display = $display.get(entity);

      let sprite  = this.sprites.get(display);

      if (display.dirty) {
        const texture = this.renderer.textures.get(display.sheet.image);

        if (texture) {
          // Remove flag before the update is complete so we don't accidentally
          // attempt to re-render the sprite more than once.
          display.dirty = false;

          // The sprite with which the old sprite will be replaced.
          let repl;

          if (isAnimated(display.sprite)) {
            repl = this.renderAnimatedSprite(display.sprite, display.sheet);

            // Always play the animation so that it gets reset.
            repl.play();
          }
          else {
            repl = this.renderStaticSprite(display.sprite, display.sheet);
          }

          // Add new sprite to stage...
          this.stage.addChild(repl);

          // ... and remove the old one (if any).
          if (sprite) {
            this.stage.removeChild(sprite);
          }

          sprite = repl;

          // Replace in cache also.
          this.sprites.set(display, repl);
        }
      }

      if (sprite) {
        // Update the sprites position.
        const trans = $trans.get(entity);

        sprite.x = trans.x;
        sprite.y = trans.y;
      }
    }
  }

}
