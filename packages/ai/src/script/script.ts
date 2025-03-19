import { Entity, Serializeable, TypeData, TypeSerializer, UUID, World } from '@heliks/tiles-engine';
import { ScriptBehavior } from './script-behavior';


/**
 * Component that executes a {@link ScriptBehavior} when attached to an entity.
 *
 * If this component is serialized, the {@link script} that is being executed requires
 * a type ID.
 *
 * - `S`: Type of script that can be executed by this component.
 */
@UUID('component.script')
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

  /**
   * Starts the execution of the given `script`.
   *
   * This will invoke the `stop()` callback on the currently running script and `start()`
   * on the script that starts execution.
   *
   * @param world Entity world.
   * @param entity The owner of this component.
   * @param script Script to run.
   */
  public start(world: World, entity: Entity, script: S): this {
    this._running?.stop?.(world, entity);
    this._running = script;
    this._running.start?.(world, entity);

    return this;
  }

  /**
   * Stops the execution of the currently running script.
   *
   * If the entity is not destroyed, or this component is removed from its owner, the
   * script system will automatically start the components {@link script} again.
   */
  public stop(world: World, entity: Entity): this {
    if (this._running) {
      this._running.stop?.(world, entity);
      this._running = undefined;
    }

    return this;
  }

}
