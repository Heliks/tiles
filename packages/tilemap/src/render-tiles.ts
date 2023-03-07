import { AssetLoader, AssetStorage } from '@heliks/tiles-assets';
import {
  Entity,
  Injectable,
  Query,
  QueryBuilder,
  ReactiveSystem,
  Ticker,
  Transform,
  Vec2,
  World
} from '@heliks/tiles-engine';
import { Camera, Container, RendererSystem, SpriteSheet, Stage } from '@heliks/tiles-pixi';
import { Tilemap } from './tilemap';
import { AnimatedSprite, Sprite } from 'pixi.js';
import { LocalTileset } from './tileset';


/**
 * Renderer plugin that draws `Tilemap` components attached to entities.
 *
 * @see Tilemap
 */
@Injectable()
export class RenderTiles extends ReactiveSystem implements RendererSystem {

  /**
   * Entities mapped to their PIXI.js display object.
   *
   * @internal
   */
  private readonly containers = new Map<Entity, Container>();

  /**
   * @param assets {@link AssetStorage}
   * @param camera {@link Camera}
   * @param loader {@link AssetLoader}
   * @param stage {@link Stage}
   * @param ticker {@link Ticker}
   */
  constructor(
    private readonly assets: AssetStorage,
    private readonly camera: Camera,
    private readonly loader: AssetLoader,
    private readonly stage: Stage,
    private readonly ticker: Ticker
  ) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder
      .contains(Tilemap)
      .contains(Transform)
      .build();
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.boot(world);
  }

  /** @internal */
  private createAnimatedSprite(local: LocalTileset, name: string): AnimatedSprite {
    const spritesheet = this.assets.resolve(local.tileset.spritesheet).data;
    const animation = spritesheet.getAnimation(name);

    return new AnimatedSprite(
      animation.frames.map(frame => {
        const texture = spritesheet.texture(frame);

        return {
          texture,
          time: animation.frameDuration ?? 100
        };
      })
    )
  }

  /** @internal */
  private createStaticSprite(local: LocalTileset, tileIdx: number): Sprite {
    return this
      .assets
      // Note: We lose the `Handle` generic here. This is a bug in typescript.
      .resolve<SpriteSheet>(local.tileset.spritesheet)
      .data
      .sprite(tileIdx);
  }

  /** @internal */
  private render(tilemap: Tilemap): void {
    tilemap.view.removeChildren();
    tilemap._animations.length = 0;

    for (let i = 0, l = tilemap.data.length; i < l; i++) {
      const gId = tilemap.data[i];

      if (gId === 0) {
        continue;
      }

      let sprite;

      const local = tilemap.tilesets.getFromGlobalId(gId);
      const index = local.getLocalIndex(gId);

      const animation = local.tileset.getAnimationName(index);

      if (animation) {
        sprite = this.createAnimatedSprite(local, animation);
        sprite.play();

        tilemap._animations.push(sprite);
      }
      else {
        sprite = this.createStaticSprite(local, index);
      }

      const tilePos = tilemap.grid.getPosition(i);

      // Adjust y-axis for tiles that are larger than the cell size of the tilemap on
      // which they are placed.
      sprite.x = tilePos.x;
      sprite.y = tilePos.y - (sprite.height - tilemap.grid.cellHeight);

      tilemap.view.addChild(sprite);
    }

    tilemap.dirty = false;
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    console.log('ADD TILEMAP')

    const tilemap = world.storage(Tilemap).get(entity);

    // Move tilemap anchor to center.
    tilemap.view
      .setPivot(0.5)
      .setFixedSize(new Vec2(
        tilemap.grid.width,
        tilemap.grid.height
      ));

    this.render(tilemap);

    this.stage.add(tilemap.view, tilemap.layer);
    this.containers.set(entity, tilemap.view);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    console.log('DROP TILEMAP')

    const container = this.containers.get(entity);

    if (container) {
      container.parent.removeChild(container);
    }
  }

  /** @internal */
  private updateTileAnimations(tilemap: Tilemap): void {
    for (const sprite of tilemap._animations) {
      sprite.update(this.ticker.getDeltaSeconds());
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    super.update(world);

    for (const entity of this.query.entities) {
      const transform = world.storage(Transform).get(entity);
      const tilemap = world.storage(Tilemap).get(entity);

      if (tilemap.dirty) {
        this.render(tilemap);
      }

      tilemap.view.x = transform.world.x * this.camera.unitSize;
      tilemap.view.y = transform.world.y * this.camera.unitSize;

      this.updateTileAnimations(tilemap);
    }
  }

}
