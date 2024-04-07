import { AppBuilder, Bundle, Type, World } from '@heliks/tiles-engine';
import { ElementFactory, getTagMetadata, TagRegistry, TagType } from './element';
import { Div, Fill, SlicePlane, Span, Sprite } from './elements';
import { UiComponent } from './ui-component';


/** Bundles declarations for UI directives. */
export interface UiBundle {

  /** List of all elements provided by this bundle. */
  elements?: Type<ElementFactory>[];

  /** List of all components provided by this bundle. */
  components?: Type<UiComponent>[];

}


export class UiComponentsBundle implements Bundle {

  private readonly declarations = new Set<Type>();

  public add(type: Type): this {
    this.declarations.add(type);
    return this;
  }

  public bundle(bundle: UiBundle): this {
    if (bundle.components) {
      for (const type of bundle.components) {
        this.add(type);
      }
    }

    if (bundle.elements) {
      for (const type of bundle.elements) {
        this.add(type);
      }
    }

    return this;
  }

  /** @internal */
  private register(world: World): void {
    const store = world.get(TagRegistry);

    for (const type of this.declarations) {
      const metadata = getTagMetadata(type);

      switch (metadata.type) {
        case TagType.Component:
          store.component(metadata.tag, type);
          break;
        case TagType.Element:
          store.element(metadata.tag, world.make(type));
          break;
      }
    }
  }

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    // Add tags that are provided by default.
    this
      .add(Div)
      .add(Fill)
      .add(SlicePlane)
      .add(Span)
      .add(Sprite);

    app
      .provide(TagRegistry)
      .run(this.register.bind(this));
  }

}
