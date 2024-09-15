import { Entity, World } from '@heliks/tiles-engine';
import { UiElement, UiNode, UiTexture } from '@heliks/tiles-ui';
import { Texture as PixiTexture } from 'pixi.js';
import { Attributes } from '../jsx-node';
import { Tag } from '../metadata';
import { UiNodeRenderer } from '../ui-node-renderer';


/** Available attributes for {@link Texture} tags. */
export interface TextureTagAttributes extends Attributes {
  texture: PixiTexture;
}

/** Renders a {@link UiTexture} element. */
@Tag('texture')
export class Texture implements UiNodeRenderer<TextureTagAttributes> {

  /** @inheritDoc */
  public render(world: World, attributes: TextureTagAttributes): Entity {
    return world.insert(
      new UiNode(),
      new UiElement(
        new UiTexture(attributes.texture)
      )
    );
  }

}
