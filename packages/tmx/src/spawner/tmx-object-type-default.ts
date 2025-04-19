import { Entity, Injectable, World } from '@heliks/tiles-engine';
import { TmxObject, TmxObjectLayer } from '../parser';
import { TmxObjectComposer } from './tmx-object-composer';
import { TmxObjectType } from './tmx-object-type';
import { SpawnableAsset, SpawnLayerProperties } from './tmx-spawner';


/**
 * Default {@link TmxObjectType} sed by the {@link TmxObjectSpawner} if no custom default
 * type was configured by the game. Internally, the {@link TmxObjectComposer} is used to
 * create entities, without additional logic.
 */
@Injectable()
export class TmxObjectTypeDefault implements TmxObjectType {

  constructor(private readonly composer: TmxObjectComposer) {}

  /** @inheritDoc */
  public ignore(): boolean {
    return false;
  }

  /** @inheritDoc */
  public create(world: World, map: SpawnableAsset, layer: TmxObjectLayer<SpawnLayerProperties>, obj: TmxObject): Entity {
    return this.composer.compose(world, map, obj, layer.properties.$layer).build();
  }

}
