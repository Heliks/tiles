import { ComponentSerializer, getTypeId, Serializer, UUID, World } from '@heliks/tiles-engine';
import { AssetLoader } from '@heliks/tiles-assets';
import { getMaterialFromId, ShaderMaterial } from '../../material';
import { SpriteRender } from './sprite-render';


export interface MaterialData {
  data: unknown;
  uuid: UUID;
}

export interface SpriteRenderData {
  anchorX: number;
  anchorY: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
  path: string;
  scaleX: number;
  scaleY: number;
  sprite: number;
  visible: boolean;
  material?: MaterialData;
}


/** @internal */
function createMaterialFromData(data: MaterialData): ShaderMaterial {
  const type = getMaterialFromId(data.uuid);

  const t = new type(data.data);

  t.setData(data.data)

  return t;
}

/**
 * Serializes {@link SpriteRender} components.
 *
 * @see ComponentSerializer
 * @see Serializer
 * @see SpriteRender
 */
export class SpriteRenderSerializer implements ComponentSerializer<SpriteRender, SpriteRenderData> {

  /** @inheritDoc */
  public deserialize(data: SpriteRenderData, world: World): SpriteRender {
    const handle = world.get(AssetLoader).load(data.path);
    const sprite = new SpriteRender(handle, data.sprite);

    sprite.opacity = data.opacity;
    sprite.visible = data.visible;

    sprite.scale.x = data.scaleX;
    sprite.scale.y = data.scaleY;

    sprite
      .setAnchor(data.anchorX, data.anchorY)
      .flip(data.flipX, data.flipY);

    if (data.material) {
      sprite.material = createMaterialFromData(data.material);
    }

    return sprite;
  }

  /** @internal */
  private serializeMaterialData(component: SpriteRender): MaterialData | undefined {
    if (component.material) {
      return {
        data: component.material.getData(),
        uuid: getTypeId(component.material.constructor)
      };
    }
  }

  /** @inheritDoc */
  public serialize(component: SpriteRender): SpriteRenderData {
    return {
      anchorX: component.anchor.x,
      anchorY: component.anchor.y,
      flipX: component.flipX,
      flipY: component.flipY,
      material: this.serializeMaterialData(component),
      opacity: component.opacity,
      path: component.spritesheet.path,
      scaleX: component.scale.x,
      scaleY: component.scale.y,
      sprite: component.spriteIndex,
      visible: component.visible,
    };
  }

}

