import { AppBuilder, Bundle, Type, World } from '@heliks/tiles-engine';
import { Element } from '@heliks/tiles-ui';
import { getTagMetadata } from './metadata';
import { Div, Fill, SlicePlane, Span, Sprite, Text, Texture } from './nodes';
import { TagRegistry } from './tag-registry';
import { UiComponent } from './ui-component';
import { UiElementRenderer } from './ui-element-renderer';
import { UiNodeRenderer } from './ui-node-renderer';


export interface UiResourceDeclarations {
  elements?: Type<Element>[];
  nodes?: Type<UiNodeRenderer>[];
  components?: Type<UiComponent>[];
}

/** @internal */
function merge<T = unknown>(a: T[] = [], b: T[] = []): T[] {
  return [...a, ...b];
}

/** UI component framework on top of the `@heliks/tiles-ui` package. */
export class UiComponentsBundle implements Bundle {

  /** Contains declarations that are added to this bundle by default. */
  private readonly default: UiResourceDeclarations = {
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

  constructor(private readonly declarations: UiResourceDeclarations) {}

  /**
   * Merges the {@link default} declarations and the user defined {@link declarations}
   * into a single {@link UiResourceDeclarations}.
   */
  public getDeclarations(): Required<UiResourceDeclarations> {
    return {
      components: merge(this.declarations.components, this.default.components),
      elements: merge(this.declarations.elements, this.default.elements),
      nodes: merge(this.declarations.nodes, this.default.nodes)
    };
  }

  /** @internal */
  private registerDeclarations(world: World): void {
    const declarations = this.getDeclarations();
    const store = world.get(TagRegistry);

    for (const type of declarations.components) {
      store.component(getTagMetadata(type).tag, type);
    }

    for (const type of declarations.elements) {
      const meta = getTagMetadata(type);

      store.node(meta.tag, new UiElementRenderer(type, meta), meta.options);
    }

    for (const type of declarations.nodes) {
      const meta = getTagMetadata(type);

      store.node(meta.tag, world.make(type), meta.options);
    }
  }

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app
      .provide(TagRegistry)
      .run(world => this.registerDeclarations(world));
  }

}
