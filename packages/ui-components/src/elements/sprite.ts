import { Handle } from '@heliks/tiles-assets';
import { Entity, World } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { UiElement, UiNode, UiSprite } from '@heliks/tiles-ui';
import { Element, ElementFactory } from '../element';
import { Attributes } from '../jsx';


/** Available attributes for {@link Sprite} elements. */
export interface SpriteAttributes<I = unknown> extends Attributes {

  /** Spritesheet used to display the sprite. */
  spritesheet: Handle<SpriteSheet<I>>;

  /** ID of the sprite that should be displayed. */
  sprite: I;

  /** Sprite tint color. */
  tint?: number;

}

/** Element that displays a sprite. */
@Element('sprite')
export class Sprite implements ElementFactory<SpriteAttributes> {

  /** @inheritDoc */
  public render(world: World, attributes: SpriteAttributes): Entity {
    const sprite = new UiSprite(attributes.spritesheet, attributes.sprite);

    if (attributes.tint !== undefined) {
      sprite.view.tint = attributes.tint;
    }

    return world.insert(
      new UiNode(),
      new UiElement(sprite)
    );
  }

}
