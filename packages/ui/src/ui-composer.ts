import { Handle } from '@heliks/tiles-assets';
import { Entity, EntityBuilder } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { Texture } from 'pixi.js';
import { FlexDirection, Style } from './layout';
import { UiNode } from './ui-node';
import { UiWidget } from './ui-widget';
import { UiSprite, UiText, UiTexture } from './widgets';


/** @internal */
type History = [builder: EntityBuilder, component: UiNode];

/** @internal */
function hasHistory(item: unknown[]): item is History {
  return item.length === 2;
}

/**
 * Utility for composing UI hierarchies. Essentially, this creates entities that always
 * have a {@link UiNode} component attached to them.
 */
export class UiComposer {

  /**
   * Last child that was added to the composed node, if any. Used to create a new
   * composer when the user wishes to move the composer {@link into} that child.
   *
   * @internal
   */
  private readonly history: [] | History = [];

  /**
   * @param builder Builder for the entity that holds the {@link uiNode UiNode} component.
   * @param uiNode UI Node component. Should already be attached to the {@link builder entity}.
   * @param parent (optional) Parent composer.
   */
  constructor(
    private readonly builder: EntityBuilder,
    private readonly uiNode: UiNode,
    private readonly parent?: UiComposer
  ) {}

  /** Adds `className` to the {@link UiNode.classList class list} of the composed UI node. */
  public class(className: string): this {
    this.uiNode.classList.add(className);

    return this;
  }

  /** Makes the composed UI hierarchy interactive. */
  public listen(): this {
    this.uiNode.interactive = true;

    return this;
  }

  /**
   * Attaches the given `component` to the entity that is created when the ui composition
   * is being {@link build build}.
   */
  public component(component: unknown): this {
    this.builder.use(component);

    return this;
  }

  /** @internal */
  private child(component: UiNode): this {
    this.builder.child(child => {
      child.use(component);

      this.history[0] = child;
      this.history[1] = component;
    });

    return this;
  }

  /** Adds a node to the composition. */
  public node(style?: Partial<Style>): this {
    return this.child(new UiNode(undefined, undefined, style));
  }

  /** Adds a node with a {@link UiWidget widget} to the composition. */
  public widget(widget: UiWidget, style?: Partial<Style>): this {
    return this.child(new UiNode(undefined, undefined, style).setWidget(widget));
  }

  /** Shorthand for adding a {@link widget} child with a {@link UiSprite} widget. */
  public sprite(spritesheet: Handle<SpriteSheet>, spriteIndex: number, style?: Partial<Style>): this {
    return this.widget(new UiSprite(spritesheet, spriteIndex), style);
  }

  /** Shorthand for adding a {@link widget} child with a {@link UiTexture} widget. */
  public texture(texture: Texture | Handle<Texture>, style?: Partial<Style>): this {
    return this.widget(new UiTexture(texture), style);
  }

  /** Shorthand for adding a {@link widget} child with a {@link UiText} widget. */
  public text(text: string, color?: number, size?: number, style?: Partial<Style>): this {
    return this.widget(new UiText(text, color, size), style);
  }

  /**
   * Moves the composer to compose on the last child that was added.
   *
   * In the example below, the text node "bar" will be a child of the text node "foo"
   * as opposed to being a child of the root node.
   *
   * ```ts
   * composer
   *  .text('foo')
   *  .into()
   *    .text('bar')
   *  .build()
   * ```
   *
   * @see exit
   */
  public into(): UiComposer {
    return hasHistory(this.history) ? new UiComposer(this.history[0], this.history[1], this) : this;
  }

  /**
   * Exits the composition of the current node after the composer was moved {@link into}
   * a child node. If this is the top-most composer already, nothing will happen.
   */
  public exit(): UiComposer {
    return this.parent ? this.parent : this;
  }

  /**
   * Creates a node that is laid out as a {@link FlexDirection.Column column} and
   * instantly moves {@link into} that node.
   */
  public column(style?: Partial<Style>): UiComposer {
    return this.node({ direction: FlexDirection.Column, ...style }).into();
  }

  /**
   * Creates a node that is laid out as a {@link FlexDirection.Row row} and instantly
   * moves {@link into} that node.
   */
  public row(style?: Partial<Style>): UiComposer {
    return this.node({ direction: FlexDirection.Row, ...style }).into();
  }

  /**
   * Builds the entity hierarchy for the composed UI and returns the root entity of that
   * hierarchy. Calling this on a composer that is a child composer will build the entire
   * composition as if it was called on the top-most composer.
   */
  public build(): Entity {
    return this.parent ? this.parent.build() : this.builder.build();
  }

}