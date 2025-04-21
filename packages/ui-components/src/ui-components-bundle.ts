import { AppBuilder, Bundle, Type, World } from '@heliks/tiles-engine';
import { getTagMetadata } from './metadata';
import { Div, Fill, SlicePlane, Span, Sprite, Text, Texture } from './nodes';
import { TagRegistry } from './tag-registry';
import { UiComponent } from './ui-component';
import { UiNodeRenderer } from './ui-node-renderer';


export interface ResourceDeclarations {
  nodes?: Type<UiNodeRenderer>[];
  components?: Type<UiComponent>[];
}

/** UI component framework on top of the `@heliks/tiles-ui` package. */
export class UiComponentsBundle implements Bundle {

  /** Contains declarations that are added to this bundle by default. */
  private readonly default: ResourceDeclarations = {
    nodes: [
      Div,
      Fill,
      SlicePlane,
      Span,
      Sprite,
      Text,
      Texture
    ]
  };

  constructor(private readonly declarations: ResourceDeclarations) {}

  /** @internal */
  private registerComponentDeclarations(world: World): void {
    const store = world.get(TagRegistry);
    const types = [
      ...this.declarations.components ?? [],
      ...this.default.components ?? []
    ];

    for (const type of types) {
      store.component(getTagMetadata(type).tag, type);
    }
  }

  /** @internal */
  private registerElementDeclarations(world: World): void {
    const store = world.get(TagRegistry);
    const types = [
      ...this.declarations.nodes ?? [],
      ...this.default.nodes ?? []
    ];

    for (const type of types) {
      store.element(getTagMetadata(type).tag, world.make(type));
    }
  }

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app
      .provide(TagRegistry)
      .run(world => {
        this.registerComponentDeclarations(world);
        this.registerElementDeclarations(world);
      });
  }

}
