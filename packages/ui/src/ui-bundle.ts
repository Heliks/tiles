import { Bundle, GameBuilder } from '@heliks/tiles-engine';
import { ProcessInteractions } from './process-interactions';


/**
 * Bunde that provides UI functionality.
 */
export class UiBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder.system(ProcessInteractions);
  }

}
