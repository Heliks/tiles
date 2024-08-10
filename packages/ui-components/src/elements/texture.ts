import { Entity, World } from '@heliks/tiles-engine';
import { UiElement, UiNode, UiTexture } from '@heliks/tiles-ui';
import { Texture as PixiTexture } from 'pixi.js';
import { Attributes } from '../jsx-node';
import { Element } from '../metadata';
import { ElementFactory } from '../tag-registry';


/** Available attributes for {@link Texture} tags. */
export interface TextureTagAttributes extends Attributes {
  texture: PixiTexture;
}

/** Renders a {@link UiTexture} element. */
@Element('texture')
export class Texture implements ElementFactory<TextureTagAttributes> {

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
