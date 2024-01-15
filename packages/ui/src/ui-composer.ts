import { Handle } from '@heliks/tiles-assets';
import { Entity, Parent, World } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { Texture } from 'pixi.js';
import { Element } from './element';
import { UiSprite, UiText, UiTexture } from './elements';
import { FlexDirection, Style } from './layout';
import { UiNode } from './ui-node';


export class UiComposer<W extends Element = Element> {

  public readonly children: UiComposer[] = [];

  constructor(
    public readonly world: World,
    public readonly entity: Entity,
    public readonly component: UiNode<W>
  ) {}

  public static edit(world: World, entity: Entity): UiComposer {
    return new UiComposer(world, entity, world.storage(UiNode).get(entity));
  }

  public getChildAt<W extends Element = Element>(index: number): UiComposer<W> {
    return this.children[index] as UiComposer<W>;
  }

  /** @internal */
  public child<T extends Element = Element>(component: UiNode<T>): UiComposer<T> {
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

  /** Adds a node with a {@link Element} to the composition. */
  public element<T extends Element>(element: T, style?: Partial<Style>): UiComposer<T> {
    return this.child(new UiNode<T>(style).setElement(element));
  }

  /** Shorthand for adding a {@link Element} child with a {@link UiSprite} element. */
  public sprite(spritesheet: Handle<SpriteSheet>, spriteIndex: number, style?: Partial<Style>): UiComposer<UiSprite> {
    return this.element(new UiSprite(spritesheet, spriteIndex), style);
  }

  /** Shorthand for adding a {@link Element} child with a {@link UiTexture} element. */
  public texture(texture: Texture | Handle<Texture>, style?: Partial<Style>): UiComposer<UiTexture> {
    return this.element(new UiTexture(texture), style);
  }

  /** Shorthand for adding a {@link Element} child with a {@link UiText} element. */
  public text(text: string, color?: number, size?: number, style?: Partial<Style>): UiComposer<UiText> {
    return this.element(new UiText(text, color, size), style);
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
