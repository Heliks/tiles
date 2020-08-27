import {
  ComponentEventType,
  EntityQuery,
  Inject,
  Injectable,
  ProcessingSystem,
  Subscriber,
  Transform,
  World
} from '@heliks/tiles-engine';
import { Renderer } from '../renderer';
import { Stage } from '../stage';
import { SpriteDisplay } from './sprite-display';
import { RENDERER_CONFIG_TOKEN, RendererConfig } from '../config';
import { FlipMode, SPRITE_SHEET_STORAGE, SpriteSheet } from '../sprite-sheet';
import { AssetStorage } from '@heliks/tiles-assets';

/** @internal */
function applyFlipMode(display: SpriteDisplay): void {
  switch (display.flipMode) {
    case FlipMode.Both:
      display.scale.x = -1;
      display.scale.y = -1;
      break;
    case FlipMode.Horizontal:
      display.scale.x = -1;
      display.scale.y = 1;
      break;
    case FlipMode.Vertical:
      display.scale.x = 1;
      display.scale.y = -1;
      break;
    case FlipMode.None:
      display.scale.x = 1;
      display.scale.y = 1;
      break;
  }
}

@Injectable()
export class SpriteDisplaySystem extends ProcessingSystem {

  /** Subscription for modifications in the [[SpriteDisplay]] storage. */
  protected onDisplayModify$!: Subscriber;

  constructor(
    @Inject(RENDERER_CONFIG_TOKEN)
    protected readonly config: RendererConfig,
    protected readonly renderer: Renderer,
    protected readonly stage: Stage,
    @Inject(SPRITE_SHEET_STORAGE)
    protected readonly storage: AssetStorage<SpriteSheet>
  ) {
    super();
  }

  /** @inheritDoc */
  public boot(world: World): void {
    super.boot(world);

    // Subscribe to modifications on the SpriteDisplay storage.
    this.onDisplayModify$ = world.storage(SpriteDisplay).events().subscribe();
  }

  /** @inheritDoc */
  public getQuery(): EntityQuery {
    return {
      contains: [
        SpriteDisplay,
        Transform
      ]
    };
  }

  /** @inheritDoc */
  public update(world: World): void {
    const _display = world.storage(SpriteDisplay);
    const _transform = world.storage(Transform);

    // Handle added / removed entities.
    for (const event of _display.events().read(this.onDisplayModify$)) {
      switch (event.type) {
        case ComponentEventType.Added:
          this.stage.add(event.component, event.component.layer);
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

        applyFlipMode(display);
      }

      // Update the sprites position.
      const trans = _transform.get(entity);

      display.x = trans.x * this.config.unitSize;
      display.y = trans.y * this.config.unitSize;

      display.rotation = trans.rotation;
    }
  }

}
