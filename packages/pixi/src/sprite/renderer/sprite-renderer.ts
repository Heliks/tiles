import { AssetStorage } from '@heliks/tiles-assets';
import { Entity, Injectable, Query, QueryBuilder, ReactiveSystem, Transform, World } from '@heliks/tiles-engine';
import { Sprite } from 'pixi.js';
import { SpriteRender } from '.';
import { RendererConfig } from '../../config';
import { Stage } from '../../layer';


@Injectable()
export class SpriteRenderer extends ReactiveSystem {

  /**
   * Maps sprites to their respective entities. This reverse mapping is to work around
   * the fact that an entity might not be alive when it is removed which makes it
   * impossible to access the sprite via the `SpriteRender` component.
   *
   * @internal
   */
  private sprites = new Map<Entity, Sprite>();

  /**
   * @param storage {@see AssetStorage}
   * @param config {@see RendererConfig}
   * @param stage {@see Stage}
   */
  constructor(
    private readonly storage: AssetStorage,
    private readonly config: RendererConfig,
    private readonly stage: Stage,
  ) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder
      .contains(SpriteRender)
      .contains(Transform)
      .build();
  }

  /** @internal */
  private insert(sprite: SpriteRender): void {
    this.stage.add(sprite._sprite, sprite.layer);

    sprite._layer = sprite.layer;
  }

  /** @internal */
  private updateLayer(sprite: SpriteRender): void {
    // Remove from current container.
    sprite._sprite.parent.removeChild(sprite._sprite);

    this.insert(sprite);
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const render = world.storage(SpriteRender).get(entity);

    // Add to render group if necessary.
    this.insert(render);
    this.sprites.set(entity, render._sprite);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    const sprite = this.sprites.get(entity);

    if (sprite) {
      sprite.parent.removeChild(sprite);
    }
  }

  /** @internal */
  private updateMaterial(render: SpriteRender): void {
    if (render.material !== render._material) {
      // If no material is applied, reset the sprite filters.
      render._sprite.filters = render.material ? render.material.filters() : [];
      render._material = render.material;
    }
  }

  /** @internal */
  private updatePosition(render: SpriteRender, transform: Transform): void {
    render._sprite.x = transform.world.x * this.config.unitSize;
    render._sprite.y = transform.world.y * this.config.unitSize;
    render._sprite.rotation = transform.rotation;
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
      const sprite = render._sprite;

      const spritesheet = this.storage.get(render.spritesheet)?.data;

      // Switch render group.
      if (render.layer !== render._layer) {
        this.updateLayer(render);
      }

      // Update sprite texture.
      if (render.dirty && spritesheet) {
        render.dirty = false;
        sprite.texture = spritesheet.texture(render.spriteIndex);
      }

      render._sprite.scale.x = render.flipX ? -render.scale.x : render.scale.x;
      render._sprite.scale.y = render.flipY ? -render.scale.y : render.scale.y;

      this.updateMaterial(render);
      this.updatePosition(render, transforms.get(entity));
    }
  }

}

