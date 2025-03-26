import { Serializeable, TypeData, TypeSerializer, UUID, World } from '@heliks/tiles-engine';
import { ScriptBehavior } from './script-behavior';


/**
 * Component that executes a {@link ScriptBehavior} when attached to an entity.
 *
 * If this component is serialized, the {@link script} that is being executed requires
 * a type ID.
 *
 * - `S`: Type of script that can be executed by this component.
 */
@UUID('tiles_script')
export class Script<S extends ScriptBehavior = ScriptBehavior> implements Serializeable<TypeData<S>> {

  /**
   * The script that is currently being executed.
   *
   * @internal
   */
  public _running?: S;

  /**
   * @param script
   */
  constructor(public script: S) {}

  /** @inheritDoc */
  public serialize(world: World): TypeData<S> {
    return world.get(TypeSerializer).serialize(world, this.script);
  }

  /** @inheritDoc */
  public deserialize(world: World, data: TypeData<S>): void {
    this.script = world.get(TypeSerializer).deserialize(world, data);
  }

}
