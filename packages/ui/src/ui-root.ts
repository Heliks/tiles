import { Container } from 'pixi.js';
import { World } from '@heliks/tiles-engine';
import { LayerId } from '@heliks/tiles-pixi';
import { Pivot, PivotPreset } from '@heliks/tiles-engine';


export enum UiAlign {
  /** Position of node is a world position. */
  World,
  /** Position of node is a screen position. */
  Screen
}

export enum Interaction {
  None,
  Clicked
}

/**
 * Callback function for when a node interaction changes.
 *
 * @see UiNode
 */
export type OnInteraction = (world: World, interaction: Interaction) => unknown;

/**
 * Component that is attached to entities that are containers for ui nodes. This is
 * the root of any UI element. Roots can be nested. Which means that one `UiRoot` can
 * be the parent of another.
 *
 * The unit in which the position is measured depends on the {@link align alignment}. If
 * it is aligned to the screen, the position is measured in pixels. If it is aligned to
 * the world instead, it is measured in game units. Width and height are always measured
 * in pixels.
 *
 * @see UiNode
 */
export class UiRoot {

  /**
   * Container where the display objects of ui nodes that are children of this root
   * will be rendered in.
   */
  public readonly container = new Container();

  /**
   * If set, will be called when the {@link interaction} of this widget changes.
   *
   * @see interactive
   * @see interaction
   */
  public interact?: OnInteraction;

  /**
   * Contains the current user interaction with this UI element. If interactions are
   * disabled the interaction will always be `Interaction.None`.
   *
   * @see interactive
   */
  public interaction = Interaction.None;

  /**
   * If set to `true`, user interactions (a.E. click, hover, etc.) will be enabled for
   * this widget. The current interaction can be read from {@link interaction}.
   */
  public interactive = false;

  /** Container pivot. This does not affect the pivot of child nodes. */
  public pivot: Pivot = PivotPreset.TOP_LEFT;

  /**
   * @param x Either world or screen position along x-axis, depending on {@link align}.
   * @param y Either world or screen position along y-axis, depending on {@link align}.
   * @param layer Id of the renderer layer on which this root should be rendered. If not
   *  specified, it will be rendered on the first layer that is available. If this root
   *  is the child of another root, this setting will be ignored.
   * @param align Determines if this UI element is aligned to the world or screen.
   */
  constructor(
    public x = 0,
    public y = 0,
    public layer?: LayerId,
    public align = UiAlign.Screen
  ) {}

  /** Creates a {@link UiRoot} that is aligned to the screen. */
  public static screen(x = 0, y = 0, layer?: LayerId): UiRoot {
    return new UiRoot(x, y, layer, UiAlign.Screen);
  }

  /** Creates a {@link UiRoot} that is aligned to the world. */
  public static world(x = 0, y = 0, layer?: LayerId): UiRoot {
    return new UiRoot(x, y, layer, UiAlign.World);
  }

  /** Shows the container. */
  public show(): this {
    this.container.visible = true;

    return this;
  }

  /** Hides the container. Hidden nodes will still be updated, but not drawn. */
  public hide(): this {
    this.container.visible = false;

    return this;
  }

  /**
   * Makes this root node interactive.
   *
   * @see interactive
   * @see interact
   */
  public toInteractive(interact?: OnInteraction): this {
    this.interactive = true;

    if (interact) {
      this.interact = interact;
    }

    return this;
  }

}

