import { Handle } from '@heliks/tiles-assets';
import { Entity, World } from '@heliks/tiles-engine';
import { SpriteId, SpriteSheet } from '@heliks/tiles-pixi';
import { UiElement, UiNode, UiSprite } from '@heliks/tiles-ui';
import { Attributes } from '../jsx-node';
import { Tag } from '../metadata';
import { UiNodeRenderer } from '../ui-node-renderer';


/** Available attributes for {@link Sprite} elements. */
export interface SpriteAttributes extends Attributes {
  /** Spritesheet used to display the sprite. */
  spritesheet: Handle<SpriteSheet>;
  /** ID of the sprite that should be displayed. */
  sprite: SpriteId;
  /** Sprite tint color. */
  tint?: number;
  /** Sprite scale. */
  scale?: number;
}

/** Element that displays a sprite. */
@Tag('sprite')
export class Sprite implements UiNodeRenderer<SpriteAttributes> {

  /** @inheritDoc */
  public render(world: World, attributes: SpriteAttributes): Entity {
    const sprite = new UiSprite(attributes.spritesheet, attributes.sprite);

    if (attributes.tint !== undefined) {
      sprite.view.tint = attributes.tint;
    }

    if (attributes.scale !== undefined) {
      sprite.scale = attributes.scale;
    }

    return world.insert(
      new UiNode(),
      new UiElement(sprite)
    );
  }

}
