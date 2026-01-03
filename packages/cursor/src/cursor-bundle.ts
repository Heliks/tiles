import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { Cursor } from './cursor';
import { CursorSystem } from './cursor-system';


export class CursorBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app.provide(Cursor).system(CursorSystem);
  }

}
