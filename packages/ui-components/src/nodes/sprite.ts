import { Handle } from '@heliks/tiles-assets';
import { Entity, World } from '@heliks/tiles-engine';
import { ShaderMaterial, SpriteId, SpriteSheet } from '@heliks/tiles-pixi';
import { UiAnimatedSprite, UiElement, UiNode, UiSprite } from '@heliks/tiles-ui';
import { Attributes } from '../jsx-node';
import { Tag } from '../metadata';
import { UiNodeRenderer } from '../ui-node-renderer';


/** @internal */
interface BaseAttrs extends Attributes {
  /** If defined, the filters of this material will be applied to the rendered sprite. */
  material?: ShaderMaterial;
  /** If defined, sets the sprite scale in both axes to this value. */
  scale?: number;
  /** Asset handle to the sprite sheet from which the sprite is rendered. */
  spritesheet: Handle<SpriteSheet>;
  /** If defined, sets the sprite tint to this value. */
  tint?: number;
}

/** Available attributes for a <sprite> tag that renders a static sprite. */
export interface StaticSpriteAttrs extends BaseAttrs {
  /** ID of the sprite that should be displayed. */
  sprite: SpriteId;
}

/** Available attributes for a <sprite> tag that renders an animated sprite. */
export interface AnimatedSpriteAttrs extends BaseAttrs {
  /** Name of the animation used to render the sprite. */
  animation: string;
}

/** Available attributes for the <sprite> tag. */
export type SpriteAttrs = AnimatedSpriteAttrs | StaticSpriteAttrs;

/** @internal */
function isAnimated(attrs: SpriteAttrs): attrs is AnimatedSpriteAttrs {
  return Boolean((attrs as AnimatedSpriteAttrs).animation);
}

/** Element that displays a sprite. */
@Tag('sprite')
export class Sprite implements UiNodeRenderer<SpriteAttrs> {

  /** @inheritDoc */
  public render(world: World, attrs: SpriteAttrs): Entity {
    let sprite;

    if (isAnimated(attrs)) {
      sprite = new UiAnimatedSprite(attrs.spritesheet, attrs.animation);
    }
    else {
      sprite = new UiSprite(attrs.spritesheet, attrs.sprite);
    }

    if (attrs.tint !== undefined) {
      sprite.view.tint = attrs.tint;
    }

    if (attrs.scale !== undefined) {
      sprite.scale = attrs.scale;
    }

    if (attrs.material) {
      sprite.view.filters = attrs.material.filters();
    }

    return world.insert(
      new UiNode(),
      new UiElement(sprite)
    );
  }

}
