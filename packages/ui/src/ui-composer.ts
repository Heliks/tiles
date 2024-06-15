import { FlexDirection } from '@heliks/flex';
import { Handle } from '@heliks/tiles-assets';
import { Entity, Parent, World } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { Texture } from 'pixi.js';
import { Element } from './element';
import { UiSprite, UiText, UiTexture } from './elements';
import { Style } from './style';
import { UiElement } from './ui-element';
import { UiNode } from './ui-node';


/** @deprecated */
export class UiComposer {

  public readonly children: UiComposer[] = [];

  constructor(
    public readonly world: World,
    public readonly entity: Entity,
    public readonly component: UiNode
  ) {}

  public static edit(world: World, entity: Entity): UiComposer {
    return new UiComposer(world, entity, world.storage(UiNode).get(entity));
  }

  public getChildAt(index: number): UiComposer {
    return this.children[index] as UiComposer;
  }

  /** @internal */
  public child(component: UiNode): UiComposer {
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
  public element<T extends Element>(element: T, style?: Partial<Style>): UiComposer {
    return this.child(new UiNode(style)).use(new UiElement(element));
  }

  /** Shorthand for adding a {@link Element} child with a {@link UiSprite} element. */
  public sprite(spritesheet: Handle<SpriteSheet>, spriteIndex: number, style?: Partial<Style>): UiComposer {
    return this.element(new UiSprite(spritesheet, spriteIndex), style);
  }

  /** Shorthand for adding a {@link Element} child with a {@link UiTexture} element. */
  public texture(texture: Texture | Handle<Texture>, style?: Partial<Style>): UiComposer {
    return this.element(new UiTexture(texture), style);
  }

  /** Shorthand for adding a {@link Element} child with a {@link UiText} element. */
  public text(text: string, color?: number, size?: number, style?: Partial<Style>): UiComposer {
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
