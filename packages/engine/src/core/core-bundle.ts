import { Circle, Rectangle, Vec2 } from '@heliks/tiles-math';
import { AppBuilder, Bundle } from '../app';
import { SerializeBundle } from '../serialize';
import { TransformBundle } from '../transform';


/** Bundle that provides built-in types to the game engine. */
export class CoreBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder
      .type(Circle, 'tiles_circle')
      .type(Rectangle, 'tiles_rectangle')
      .type(Vec2, 'tiles_vec2')
      .bundle(new TransformBundle())
      .bundle(new SerializeBundle());
  }

}
