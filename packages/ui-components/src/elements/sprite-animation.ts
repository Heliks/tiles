import { Handle } from '@heliks/tiles-assets';
import { Entity, World } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { UiAnimatedSprite, UiElement, UiNode } from '@heliks/tiles-ui';
import { Attributes } from '../jsx-node';
import { Element } from '../metadata';
import { ElementFactory } from '../tag-registry';


/** Available attributes for {@link SpriteAnimation} elements. */
export interface SpriteAnimationAttributes<I = unknown> extends Attributes {

  /** Spritesheet used to display the sprite. */
  spritesheet: Handle<SpriteSheet<I>>;

  /** Name of the animation that is played by the element. */
  animation: string;

}

/** Element that displays a sprite animation. */
@Element('sprite-animation')
export class SpriteAnimation implements ElementFactory<SpriteAnimationAttributes> {

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
