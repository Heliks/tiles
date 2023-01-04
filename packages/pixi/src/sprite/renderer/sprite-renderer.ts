import { AssetLoader, AssetStorage } from '@heliks/tiles-assets';
import {
  Entity,
  Injectable,
  Query,
  QueryBuilder,
  ReactiveSystem,
  Screen,
  Transform,
  World
} from '@heliks/tiles-engine';
import { Sprite } from 'pixi.js';
import { SpriteRender } from '.';
import { Renderer } from '../../renderer';
import { Stage } from '../../stage';
import { SpriteSheet } from '../sprite-sheet';
import { RendererConfig } from '../../config';


@Injectable()
export class SpriteRenderer extends ReactiveSystem {

  /**
   * Maps sprites to their respective entities. This reverse mapping is to work around
   * the fact that an entity might not be alive when it is removed which makes it
   * impossible to access the sprite via the `SpriteRender` component.
   */
  private sprites = new Map<Entity, Sprite>();

  /** @internal */
  private storage: AssetStorage<SpriteSheet>;

  constructor(
    private readonly config: RendererConfig,
    private readonly renderer: Renderer,
    private readonly stage: Stage,
    loader: AssetLoader
  ) {
    super();

    this.storage = loader.storage(SpriteSheet);
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(SpriteRender).contains(Transform).build();
  }

  /** @internal */
  private updateRenderGroup(world: World, render: SpriteRender): void {
    this.stage.insert(render._sprite, render.group);

    render._group = render.group;
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const render = world.storage(SpriteRender).get(entity);

    // Add to render group if necessary.
    this.updateRenderGroup(world, render);
    this.sprites.set(entity, render._sprite);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    const sprite = this.sprites.get(entity);

    if (sprite) {
      sprite.parent.removeChild(sprite);
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    // Update events from reactive system.
    super.update(world);

    const displays = world.storage(SpriteRender);
    const transforms = world.storage(Transform);

    // Update sprites.
    for (const entity of this.query.entities) {
      const render = displays.get(entity);
      const sheet = this.storage.get(render.spritesheet)?.data;

      const sprite = render._sprite;

      // Change render group.
      if (render.group !== render._group) {
        // Remove from current container.
        render._sprite.parent.removeChild(render._sprite);

        this.updateRenderGroup(world, render);
      }

      // No sheet means that the asset hasn't finished loading yet.
      if (render.dirty && sheet) {
        render.dirty = false;

        sprite.texture = sheet.texture(render.spriteIndex);
      }

      // Flip sprite.
      sprite.scale.x = render.flipX ? -render.scale.x : render.scale.x;
      sprite.scale.y = render.flipY ? -render.scale.y : render.scale.y;

      // Update the sprites position.
      const trans = transforms.get(entity);

      sprite.x = trans.world.x * this.config.unitSize;
      sprite.y = trans.world.y * this.config.unitSize;

      sprite.rotation = trans.rotation;
    }
  }

}

