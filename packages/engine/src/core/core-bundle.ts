import { Bundle, GameBuilder } from '../game';
import { Circle, Grid, Rectangle, Vec2 } from '@heliks/tiles-math';
import { SerializationBundle } from '../serialization';
import { TransformBundle } from '../transform';


/** Bundle that provides built-in types to the game engine. */
export class CoreBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder
      .type(Grid)
      .type(Circle)
      .type(Rectangle)
      .type(Vec2)
      .bundle(new SerializationBundle())
      .bundle(new TransformBundle());
  }

}
