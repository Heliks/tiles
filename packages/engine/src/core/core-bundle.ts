import { AppBuilder, Bundle } from '../app';
import { SerializeBundle } from '../serialize';
import { TransformBundle } from '../transform';


/** Bundle that provides built-in types to the game engine. */
export class CoreBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder
      .bundle(new TransformBundle())
      .bundle(new SerializeBundle());
  }

}
