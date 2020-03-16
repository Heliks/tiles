import { Injectable } from "@tiles/injector";
import { ProcessingSystem, Transform, World } from "@tiles/engine";
import { Sprite } from "pixi.js";
import { Renderer } from "../renderer";
import { Stage } from "../stage";
import { Query } from "@tiles/entity-system";
import { SpriteSheet } from "./sprite-sheet";
import { cropTexture } from "../utils";
import { SpriteDisplay } from "./sprite-display";

@Injectable()
export class SpriteDisplaySystem extends ProcessingSystem {

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

  /** todo */
  protected getSprite(display: SpriteDisplay): Sprite {
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
    const $trans   = world.storage(Transform);

    for (const entity of this.group.entities) {
      const display = $display.get(entity);
      const sprite = this.getSprite(display);

      if (display.dirty) {
        const texture = this.renderer.textures.get(display.sheet.image);

        if (texture) {
          // Remove flag before the update is complete so we don't accidentally
          // attempt to re-render the sprite more than once.
          display.dirty = false;

          sprite.texture = cropTexture(
            texture.data,
            display.sheet.pos(display.spriteId as number),
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