import { Handle } from '@heliks/tiles-assets';
import { Entity, World } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { UiAnimatedSprite, UiElement, UiNode } from '@heliks/tiles-ui';
import { Attributes } from '../jsx-node';
import { Tag } from '../metadata';
import { UiNodeRenderer } from '../ui-node-renderer';


/** Available attributes for {@link SpriteAnimation} elements. */
export interface SpriteAnimationAttributes extends Attributes {
  /** Name of the animation that is played by the element. */
  animation: string;
  /** Spritesheet used to display the sprite. */
  spritesheet: Handle<SpriteSheet>;
}

/** Element that displays a sprite animation. */
@Tag('sprite-animation')
export class SpriteAnimation implements UiNodeRenderer<SpriteAnimationAttributes> {

  /** @inheritDoc */
  public render(world: World, attributes: SpriteAnimationAttributes): Entity {
    return world.insert(
      new UiNode(),
      new UiElement(
        new UiAnimatedSprite(
          attributes.spritesheet,
          attributes.animation
        )
      )
    );
  }

}
