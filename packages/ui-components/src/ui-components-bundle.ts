import { AppBuilder, Bundle, Type, World } from '@heliks/tiles-engine';
import { ElementFactory, ElementRegistry, getNodeMetadata } from './element';
import { Div, Fill, SlicePlane, Span, Sprite } from './elements';


export class UiComponentsBundle implements Bundle {

  private readonly factories = new Set<Type<ElementFactory>>();

  public tag(type: Type<ElementFactory>): this {
    this.factories.add(type);

    return this;
  }

  /** @internal */
  private register(world: World): void {
    const store = world.get(ElementRegistry);

    for (const type of this.factories) {
      store.add(getNodeMetadata(type).tag, world.make(type));
    }
  }

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    // Add tags that are provided by default.
    this
      .tag(Div)
      .tag(Fill)
      .tag(SlicePlane)
      .tag(Span)
      .tag(Sprite);

    app
      .provide(ElementRegistry)
      .run(this.register.bind(this));
  }

}
