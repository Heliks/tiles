import { contains, Entity, Injectable, ReactiveSystem, Transform, World } from '@heliks/tiles-engine';
import { Renderer } from '../../renderer';
import { Stage } from '../../stage';
import { SpriteDisplay } from './index';
import { SpriteSheetStorage } from '../sprite-sheet';
import { Screen } from '../../screen';
import { Sprite } from 'pixi.js';


@Injectable()
export class SpriteDisplaySystem extends ReactiveSystem {

  /**
   * Maps sprites to their respective entities. This reverse mapping is to work around
   * the fact that an entity might not be alive when it is removed which makes it
   * impossible to access the sprite via the `SpriteRender` component.
   */
  private sprites = new Map<Entity, Sprite>();

  constructor(
    private readonly dimensions: Screen,
    private readonly renderer: Renderer,
    private readonly stage: Stage,
    private readonly storage: SpriteSheetStorage
  ) {
    super(contains(SpriteDisplay, Transform));
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const { _sprite } = world.storage(SpriteDisplay).get(entity);

    this.sprites.set(entity, _sprite);
    this.stage.add(_sprite);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    const sprite = this.sprites.get(entity);

    if (sprite) {
      this.stage.remove(sprite);
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

