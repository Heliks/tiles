import { Handle } from '@heliks/tiles-assets';
import { Entity, Parent, World } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { Texture } from 'pixi.js';
import { FlexDirection, Style } from './layout';
import { UiNode } from './ui-node';
import { UiWidget } from './ui-widget';
import { UiSprite, UiText, UiTexture } from './widgets';


export class UiComposer<W extends UiWidget = UiWidget> {

  public readonly children: UiComposer[] = [];

  constructor(
    public readonly world: World,
    public readonly entity: Entity,
    public readonly component: UiNode<W>
  ) {}

  public static edit(world: World, entity: Entity): UiComposer {
    return new UiComposer(world, entity, world.storage(UiNode).get(entity));
  }

  public getChildAt<W extends UiWidget = UiWidget>(index: number): UiComposer<W> {
    return this.children[index] as UiComposer<W>;
  }

  /** @internal */
  public child<T extends UiWidget = UiWidget>(component: UiNode<T>): UiComposer<T> {
    const entity = this.world.insert(component, new Parent(this.entity));
    const compose = new UiComposer(this.world, entity, component);

    this.children.push(compose);

    return compose;
  }

  /** Adds a node to the composition. */
  public node(style?: Partial<Style>): UiComposer {
    return this.child(new UiNode(style));
  }

  /** Creates a node that is laid out as a {@link FlexDirection.Column column}. */
  public column(style?: Partial<Style>): UiComposer {
    return this.node({ direction: FlexDirection.Column, ...style });
  }

  /** Creates a node that is laid out as a {@link FlexDirection.Row row}. */
  public row(style?: Partial<Style>): UiComposer {
    return this.node({ direction: FlexDirection.Row, ...style });
  }

  /** Adds a node with a {@link UiWidget widget} to the composition. */
  public widget<T extends UiWidget>(widget: T, style?: Partial<Style>): UiComposer<T> {
    return this.child(new UiNode<T>(style).setWidget(widget));
  }

  /** Shorthand for adding a {@link widget} child with a {@link UiSprite} widget. */
  public sprite(spritesheet: Handle<SpriteSheet>, spriteIndex: number, style?: Partial<Style>): UiComposer<UiSprite> {
    return this.widget(new UiSprite(spritesheet, spriteIndex), style);
  }

  /** Shorthand for adding a {@link widget} child with a {@link UiTexture} widget. */
  public texture(texture: Texture | Handle<Texture>, style?: Partial<Style>): UiComposer<UiTexture> {
    return this.widget(new UiTexture(texture), style);
  }

  /** Shorthand for adding a {@link widget} child with a {@link UiText} widget. */
  public text(text: string, color?: number, size?: number, style?: Partial<Style>): UiComposer<UiText> {
    return this.widget(new UiText(text, color, size), style);
  }

  /**
   * Attaches the given `component` to the entity that is created when the ui composition
   * is being {@link build build}.
   */
  public use(component: object): this {
    this.world.attach(this.entity, component);

    return this;
  }

  /** Makes the composed UI hierarchy interactive. */
  public listen(): this {
    this.component.interactive = true;

    return this;
  }

  public destroy(): void {
    this.world.destroy(this.entity);
  }

}
