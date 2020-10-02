import { Sprite } from 'pixi.js';

/** Determines in which direction(s) a sprite should be flipped. */
export enum FlipMode {
  /** Sprite is not flipped at all. */
  None,
  /** Sprite is flipped both horizontally and vertically. */
  Both,
  Horizontal,
  Vertical
}

/** Flips a `sprite` in the given `direction`. */
export function flipSprite(sprite: Sprite, direction: FlipMode): void {
  switch (direction) {
    case FlipMode.Both:
      sprite.scale.x = -1;
      sprite.scale.y = -1;
      break;
    case FlipMode.Horizontal:
      sprite.scale.x = -1;
      sprite.scale.y = 1;
      break;
    case FlipMode.Vertical:
      sprite.scale.x = 1;
      sprite.scale.y = -1;
      break;
    case FlipMode.None:
      sprite.scale.x = 1;
      sprite.scale.y = 1;
      break;
  }
}
