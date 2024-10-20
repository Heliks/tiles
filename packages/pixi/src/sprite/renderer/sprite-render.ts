import { AssetLoader, Handle } from '@heliks/tiles-assets';
import { Serializeable, UUID, Vec2, World } from '@heliks/tiles-engine';
import { Sprite } from 'pixi.js';
import { Layer, LayerId } from '../../layer';
import { getMaterialFromId, ShaderMaterial } from '../../material';
import { SpriteId, SpriteSheet } from '../sprite-sheet';


export interface MaterialData {
  data: unknown;
  uuid: UUID;
}

export interface SpriteRenderData<I extends SpriteId> {
  anchorX: number;
  anchorY: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
  spritesheet: string;
  spriteId: I;
  scaleX: number;
  scaleY: number;
  visible: boolean;
  material?: MaterialData;
  layer?: LayerId;
}

/** @internal */
function createMaterialFromData(data: MaterialData): ShaderMaterial {
  const type = getMaterialFromId(data.uuid);

  // eslint-disable-next-line new-cap
  const t = new type(data.data);

  t.setData(data.data)

  return t;
}

/** Component that renders a sprite on the entity to which it is attached to. */
@UUID('pixi.SpriteRender')
export class SpriteRender<I extends SpriteId = SpriteId> implements Serializeable<SpriteRenderData<I>> {

  /** @internal */
  public readonly _sprite = new Sprite();

  /**
   * Contains the current sprite origin. Do not update directly.
   *
   * @see setAnchor
   */
  public anchor = new Vec2(0, 0);

  /** If set to `true` the sprite will be flipped on the x axis. */
  public flipX = false;

  /** If set to `true` the sprite will be flipped on the y axis. */
  public flipY = false;

  /** A {@link ShaderMaterial material} that should be applied to the sprite. */
  public material?: ShaderMaterial;

  /** Scale factor of the sprite. */
  public scale = new Vec2(1, 1);

  /**
   * After the component has been added to the world, this will contain the layer on
   * which the sprite is currently being rendered.
   *
   * @internal
   */
  public _layer!: Layer;

  /**
   * Contains the layer ID that is currently being used to determine {@link _layer}
   *
   * @internal
   */
  public _layerId?: LayerId;

  /**
   * Contains the material that is currently being applied to the sprite.
   *
   * @internal
   */
  public _material?: ShaderMaterial;

  /**
   * Contains the currently applied sprite ID, if any.
   *
   * @internal
   */
  public _spriteId?: SpriteId;

  /** The opacity of the sprite. Value from 0-1. */
  public set opacity(opacity: number) {
    this._sprite.alpha = opacity;
  }

  public get opacity(): number {
    return this._sprite.alpha;
  }

  /** If this is set to `false`, the sprite will not be rendered. */
  public set visible(value: boolean) {
    this._sprite.visible = value;
  }

  public get visible(): boolean {
    return this._sprite.visible;
  }

  /**
   * @param spritesheet Asset {@link Handle} that points to a {@link Spritesheet},
   * @param spriteId Index of the sprite that should be rendered.
   * @param layer (optional) Renderer layer ID.
   */
  constructor(
    public spritesheet: Handle<SpriteSheet<I>>,
    public spriteId: I,
    public layer?: LayerId
  ) {
    // Using the middle position instead of the top-left position will save us extra
    // calculations during the renderer update.
    this.setAnchor(0.5, 0.5);
  }

  /** Flips the sprite. */
  public flip(x = false, y = false): this {
    this.flipX = x;
    this.flipY = y;

    return this;
  }

  /** Updates the position where the sprite is anchored relative to its position. */
  public setAnchor(x: number, y: number): this {
    this._sprite.anchor.set(x, y);

    this.anchor.x = this._sprite.anchor.x;
    this.anchor.y = this._sprite.anchor.y;

    return this;
  }

  /** Sets the {@link visible visibility} of this sprite to `true`. */
  public show(): this {
    this._sprite.visible = true;

    return this;
  }

  /** Sets the {@link visible visibility} of this sprite to `false`. */
  public hide(): this {
    this._sprite.visible = false;

    return this;
  }

  /** @inheritDoc */
  public serialize(): SpriteRenderData<I> {
    const { flipX, flipY, layer, opacity, spriteId, visible } = this;

    return {
      anchorX: this.anchor.x,
      anchorY: this.anchor.y,
      flipX,
      flipY,
      layer,
      opacity,
      scaleX: this.scale.x,
      scaleY: this.scale.y,
      spriteId,
      spritesheet: this.spritesheet.file,
      visible
    };
  }

  /** @inheritDoc */
  public deserialize(world: World, data: SpriteRenderData<I>): void {
    this.spritesheet = world.get(AssetLoader).load(data.spritesheet);
    this.spriteId = data.spriteId;
    this.layer = data.layer;

    this.opacity = data.opacity;
    this.visible = data.visible;

    this.scale.x = data.scaleX;
    this.scale.y = data.scaleY;

    this
      .setAnchor(data.anchorX, data.anchorY)
      .flip(data.flipX, data.flipY);

    if (data.material) {
      this.material = createMaterialFromData(data.material);
    }
  }

}
