import { contains, Injectable, ProcessingSystem, World } from '@heliks/tiles-engine';
import { Executables } from './executables';
import { Script } from './script';

/**
 * System that runs scripts. Scripts must be registered on the `Executables` resource
 * before they can be executed.
 */
@Injectable()
export class ScriptHandler extends ProcessingSystem {

  constructor(private readonly scripts: Executables) {
    super(contains(Script));
  }

  /** @inheritDoc */
  public update(world: World): void {
    const scripts = world.storage(Script);

    for (const entity of this.group.entities) {
      const script = scripts.get(entity);

      if (script.isExecuted) {
        const executable = this.scripts.get(script.name);

        if (executable) {
          executable.exec(world, entity);
        }
        else {
          console.warn(`Missing script "${script.name}"`);
        }

        // Remove flag so script can be executed again.
        script.isExecuted = false;
      }
    }
  }

}
