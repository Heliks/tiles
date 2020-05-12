import { Inject, Injectable } from "@tiles/injector";
import { ProcessingSystem, Subscriber, Transform, World } from "@tiles/engine";
import { Sprite } from "pixi.js";
import { Renderer } from "../renderer";
import { Stage } from "../stage";
import { ComponentEventType, Entity, Query } from "@tiles/entity-system";
import { cropTexture, flip } from "../utils";
import { SpriteDisplay } from "./sprite-display";
import { RendererConfig, RENDERER_CONFIG_TOKEN } from "../config";
import { SpriteSheetStorage } from "./sprite-sheet";

@Injectable()
export class SpriteDisplaySystem extends ProcessingSystem {

  /** Subscription for modifications in the [[SpriteDisplay]] storage. */
  protected onDisplayModify$!: Subscriber;

  /** Contains sprites mapped to the [[Entity]] to which they belong. */
  protected sprites = new Map<Entity, Sprite>();

  constructor(
    @Inject(RENDERER_CONFIG_TOKEN)
    protected readonly config: RendererConfig,
    protected readonly renderer: Renderer,
    protected readonly stage: Stage,
    protected readonly storage: SpriteSheetStorage
  ) {
    super();
  }

  /** {@inheritDoc} */
  public boot(world: World): void {
    super.boot(world);

    // Subscribe to modifications on the SpriteDisplay storage.
    this.onDisplayModify$ = world.storage(SpriteDisplay).events().subscribe();
  }

  /** {@inheritDoc} */
  public getQuery(): Query {
    return {
      contains: [
        SpriteDisplay,
        Transform
      ]
    };
  }

  /** Adds the sprite for `entity` to the game stage. */
  protected create(entity: Entity): void {
    const sprite = new Sprite();

    // The engine uses center positions instead of top left for transforms,
    // this will save us a calculation in `update()`.
    sprite.anchor.set(0.5);

    this.sprites.set(entity, sprite);
    this.stage.addChild(sprite);
  }

  /** Removes the sprite of `entity` from the game stage. */
  protected delete(entity: Entity): void {
    const sprite = this.sprites.get(entity);

    if (sprite) {
      this.stage.removeChild(sprite);
      this.sprites.delete(entity);
    }
  }

  /** {@inheritDoc} */
  public update(world: World): void {
    const _display = world.storage(SpriteDisplay);
    const _transform = world.storage(Transform);

    // Handle added / removed entities.
    for (const event of _display.events().read(this.onDisplayModify$)) {
      switch (event.type) {
      case ComponentEventType.Added:
        this.create(event.entity);
        break;
      case ComponentEventType.Removed:
        this.delete(event.entity);
        break;
      }
    }

    // Update sprites.
    for (const entity of this.group.entities) {
      const display = _display.get(entity);
      const sheet = this.storage.get(display.sheet);

      // This should never fail as long as the user doesn't meddle with the queried
      // entity group manually.
      const sprite = this.sprites.get(entity) as Sprite;

      // No sheet means that the asset hasn't finished loading yet.
      if (display.dirty && sheet) {
        // Remove flag before the update is complete so we don't accidentally
        // attempt to re-render the sprite more than once.
        display.dirty = false;

        sprite.texture = cropTexture(
          sheet.data.texture,
          sheet.data.pos(display.spriteIndex as number),
          sheet.data.getSpriteSize()
        );

        flip(sprite, display.flip);
      }

      // Update the sprites position.
      const trans = _transform.get(entity);

      sprite.x = trans.x * this.config.unitSize;
      sprite.y = trans.y * this.config.unitSize;
    }
  }

}
