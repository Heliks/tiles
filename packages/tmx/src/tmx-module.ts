import { GameBuilder, Module } from '@heliks/tiles-engine';
import { GameMapHandler } from './game-map-handler';
import { Executables, ScriptHandler } from './script';

/**
 * Module for loading and handling TMX maps.
 */
export class TmxModule implements Module {

  /** @internal */
  // private spawners = new ObjectSpawnerBag();

  /**
   public registerObjectSpawner(spawner: ObjectSpawner): this {
    this.spawners.add(spawner);

    return this;
  }
   */


  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder
      // .provide({
      //   token: ObjectSpawnerBag,
      //         value: this.spawners
      //    })
      .provide(Executables)
      .system(GameMapHandler)
      .system(ScriptHandler);
  }

}
