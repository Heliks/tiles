import {
  contains,
  Entity,
  Inject,
  Injectable,
  Parent,
  ReactiveSystem,
  Subscriber,
  Transform,
  World
} from '@heliks/tiles-engine';
import { Renderer } from '../../renderer';
import { Stage } from '../../stage';
import { SpriteDisplay } from '../components';
import { SPRITE_SHEET_STORAGE, SpriteSheet } from '../sprite-sheet';
import { AssetStorage } from '@heliks/tiles-assets';
import { ScreenDimensions } from '../../screen-dimensions';
import { RenderNode } from '../../renderer-node';
import { Sprite } from 'pixi.js';

/**
 * Returns the `RenderNode` component of the parent entity of `entity`. If `entity` has
 * no `Parent` component or if the parent entity has no `RenderNode`, `undefined` is
 * returned instead.
 */
function getParentNode(world: World, entity: Entity): RenderNode | undefined {
  const parents = world.storage(Parent);

  if (parents.has(entity)) {
    const nodes = world.storage(RenderNode);
    const parent = parents.get(entity).entity;

    if (nodes.has(parent)) {
      return nodes.get(parent);
    }
  }
}

@Injectable()
export class SpriteDisplaySystem extends ReactiveSystem {

  /** Subscription for modifications in the [[SpriteDisplay]] storage. */
  private subscriber!: Subscriber;

  /**
   * Maps sprites to their respective entities. This reverse mapping is to work around
   * the fact that an entity might not be alive when it is removed which makes it
   * impossible to access the sprite via the `SpriteRender` component.
   */
  private sprites = new Map<Entity, Sprite>();

  constructor(
    @Inject(SPRITE_SHEET_STORAGE)
    private readonly storage: AssetStorage<SpriteSheet>,
    private readonly dimensions: ScreenDimensions,
    private readonly renderer: Renderer,
    private readonly stage: Stage
  ) {
    super(contains(SpriteDisplay, Transform));
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const parent = getParentNode(world, entity);
    const sprite = world.storage(SpriteDisplay).get(entity)._sprite;

    this.sprites.set(entity, sprite);

    parent ? parent.add(sprite) : this.stage.add(sprite);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    const sprite = this.sprites.get(entity);

    if (sprite) {
      const parent = getParentNode(world, entity);

      parent ? parent.remove(sprite) : this.stage.remove(sprite);
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    // Update events from reactive system.
    super.update(world);

    const displays = world.storage(SpriteDisplay);
    const transforms = world.storage(Transform);

    // Update sprites.
    for (const entity of this.group.entities) {
      const display = displays.get(entity);
      const sheet = typeof display.spritesheet === 'symbol'
        ? this.storage.get(display.spritesheet)?.data
        : display.spritesheet;

      const sprite = display._sprite;

      // No sheet means that the asset hasn't finished loading yet.
      if (display.dirty && sheet) {
        display.dirty = false;

        sprite.texture = sheet.texture(display.spriteIndex);

        // Flip sprite.
        sprite.scale.x = display.flipX ? -display.scale.x : display.scale.x;
        sprite.scale.y = display.flipY ? -display.scale.y : display.scale.y;
      }

      // Update the sprites position.
      const trans = transforms.get(entity);

      sprite.x = trans.world.x * this.dimensions.unitSize;
      sprite.y = trans.world.y * this.dimensions.unitSize;

      sprite.rotation = trans.rotation;
    }
  }

}

