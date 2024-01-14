import { Preset, PresetId } from '../../ecs';
import { getTypeName, isType, TypeLike } from '../../utils';
import { App } from '../app';
import { Task } from './task';


/** Registers an entity {@link Preset preset}. */
export class AddPreset implements Task {

  /**
   * @param id Unique id with which the {@link preset} will be registered.
   * @param preset The entity {@link Preset} to register.
   */
  constructor(public readonly id: PresetId, public readonly preset: TypeLike<Preset>) {}

  /**
   * Returns the {@link preset} instance. If {@link preset} is a {@link Type}, it will
   * be created using the service container.
   */
  public getPreset(app: App): Preset {
    return isType(this.preset) ? app.container.make(this.preset) : this.preset;
  }

  /** @inheritDoc */
  public exec(app: App): void {
    const preset = this.getPreset(app);

    app.container.instance(preset);
    app.world.presets.set(this.id, preset);
  }

  /** @internal */
  public toString(): string {
    return 'Add Preset: ' + getTypeName(this.preset);
  }

}
