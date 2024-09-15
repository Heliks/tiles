import { Handle } from '@heliks/tiles-assets';
import { Entity, World } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { UiElement, UiNode, UiSlicePlane } from '@heliks/tiles-ui';
import { Attributes } from '../jsx-node';
import { Tag } from '../metadata';
import { UiNodeRenderer } from '../ui-node-renderer';


/** Available attributes for {@link SlicePlane} elements. */
export interface SlicePlaneAttributes<I = unknown> extends Attributes {

  /** Spritesheet from which the slice plane texture will be created. */
  spritesheet: Handle<SpriteSheet<I>>;

  /** ID of the sprite that should be used as the slice plane texture. */
  sprite: I;

  /** Width of each side of the slice plane in px. */
  sides: number;

}

/** Element that uses the {@link UiSlicePlane} element as {@link UiElement}. */
@Tag('slice-plane')
export class SlicePlane implements UiNodeRenderer<SlicePlaneAttributes> {

  /** @inheritDoc */
  public render(world: World, attributes: SlicePlaneAttributes): Entity {
    return world.insert(
      new UiNode(),
      new UiElement(
        new UiSlicePlane(attributes.spritesheet, attributes.sprite).sides(Number(attributes.sides))
      )
    );
  }

}
