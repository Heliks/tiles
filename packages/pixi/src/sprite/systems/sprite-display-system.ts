import {
  ComponentEventType,
  contains,
  Inject,
  Injectable,
  ProcessingSystem,
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
import { RenderNode } from "../../renderer-node";

@Injectable()
export class SpriteDisplaySystem extends ProcessingSystem {

  /** Subscription for modifications in the [[SpriteDisplay]] storage. */
  protected subscriber!: Subscriber;

  constructor(
    private readonly dimensions: ScreenDimensions,
    private readonly renderer: Renderer,
    private readonly stage: Stage,
    @Inject(SPRITE_SHEET_STORAGE)
    private readonly storage: AssetStorage<SpriteSheet>
  ) {
    super(contains(SpriteDisplay, Transform));
  }

  /** @inheritDoc */
  public boot(world: World): void {
    super.boot(world);

    // Subscribe to modifications on the SpriteDisplay storage.
    this.subscriber = world.storage(SpriteDisplay).events().subscribe();
  }

  /** @inheritDoc */
  public update(world: World): void {
    const displays = world.storage(SpriteDisplay);
    const nodes = world.storage(RenderNode);
    const transforms = world.storage(Transform);

    // Handle added / removed entities.
    for (const event of displays.events().read(this.subscriber)) {
      switch (event.type) {
        case ComponentEventType.Added:
          if (event.component.node !== undefined) {
            nodes.get(event.component.node).add(event.component._sprite);
          }
          else {
            this.stage.add(event.component._sprite);
          }
          break;
        case ComponentEventType.Removed:
          if (event.component.node !== undefined) {
            nodes.get(event.component.node).remove(event.component._sprite);
          }
          else {
            this.stage.remove(event.component._sprite);
          }
          break;
      }
    }

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
        sprite.scale.x = display.flipX ? -1 : 1;
        sprite.scale.y = display.flipY ? -1 : 1;
      }

      // Update the sprites position.
      const trans = transforms.get(entity);

      sprite.x = trans.world.x * this.dimensions.unitSize;
      sprite.y = trans.world.y * this.dimensions.unitSize;

      sprite.rotation = trans.rotation;
    }
  }

}
