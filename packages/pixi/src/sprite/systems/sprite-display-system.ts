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

@Injectable()
export class SpriteDisplaySystem extends ProcessingSystem {

  /** Subscription for modifications in the [[SpriteDisplay]] storage. */
  protected onDisplayModify$!: Subscriber;

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
    this.onDisplayModify$ = world.storage(SpriteDisplay).events().subscribe();
  }

  /** @inheritDoc */
  public update(world: World): void {
    const _display = world.storage(SpriteDisplay);
    const _transform = world.storage(Transform);

    // Handle added / removed entities.
    for (const event of _display.events().read(this.onDisplayModify$)) {
      switch (event.type) {
        case ComponentEventType.Added:
          this.stage.add(event.component, event.component.node);
          break;
        case ComponentEventType.Removed:
          this.stage.remove(event.component);
          break;
      }
    }

    // Update sprites.
    for (const entity of this.group.entities) {
      const display = _display.get(entity);
      const sheet = typeof display.spritesheet === 'symbol'
        ? this.storage.get(display.spritesheet)?.data
        : display.spritesheet;

      // No sheet means that the asset hasn't finished loading yet.
      if (display.dirty && sheet) {
        display.dirty = false;
        display.texture = sheet.texture(display.spriteIndex);

        // Flip sprite.
        display.scale.x = display.flipX ? -1 : 1;
        display.scale.y = display.flipY ? -1 : 1;
      }

      // Update the sprites position.
      const trans = _transform.get(entity);

      display.x = trans.world[0] * this.dimensions.unitSize;
      display.y = trans.world[1] * this.dimensions.unitSize;

      display.rotation = trans.rotation;
    }
  }

}
