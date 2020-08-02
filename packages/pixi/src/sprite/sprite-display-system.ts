import { Inject, Injectable } from '@tiles/engine';
import { ComponentEventType, EntityQuery, ProcessingSystem, Subscriber, Transform, World } from '@tiles/engine';
import { Renderer } from '../renderer';
import { Stage } from '../stage';
import { flip } from '../utils';
import { SpriteDisplay } from './sprite-display';
import { RENDERER_CONFIG_TOKEN, RendererConfig } from '../config';
import { SPRITE_SHEET_STORAGE, SpriteSheet } from '../sprite-sheet';
import { AssetStorage } from '@tiles/assets';

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
      const sheet = typeof display.sheet === 'symbol'
        ? this.storage.get(display.sheet)?.data
        : display.sheet;

      // No sheet means that the asset hasn't finished loading yet.
      if (display.dirty && sheet) {
        // Remove flag before the update is complete so we don't accidentally attempt
        // to re-render the sprite more than once.
        display.dirty = false;

        display.texture = sheet.texture(display.spriteIndex as number);

        flip(display, display.flip);
      }

      // Update the sprites position.
      const trans = _transform.get(entity);

      display.x = trans.x * this.config.unitSize;
      display.y = trans.y * this.config.unitSize;
    }
  }

}
