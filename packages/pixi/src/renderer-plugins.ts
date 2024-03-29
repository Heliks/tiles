import { World } from "@heliks/tiles-engine";
import { Renderer } from './renderer';


export interface RenderPass {

  /**
   * Called after the first render pass.
   */
  render(renderer: Renderer): void;

}

/**
 * A renderer plugin is basically the same as a normal game system, but instead of
 * being executed by the system manager they are directly called by the renderer.
 *
 * Additional renderer systems should be added as a renderer plugin to ensure that they
 * all run in the same engine state, which could otherwise lead to inconsistent state
 * between renderer and data.
 *
 * Plugins can implement lifecycle hooks.
 */
export interface RendererPlugin extends Partial<RenderPass> {

  /** Called once on each frame before the scene is drawn. */
  update(world: World): void;

}

/** Manages renderer plugins. */
export class RendererPlugins {

  /**
   * Contains all registered plugins.
   *
   * @see RendererPlugin
   */
  public readonly items: RendererPlugin[] = [];

  /** Adds a `plugin`. */
  public add(plugin: RendererPlugin): this {
    this.items.push(plugin);

    return this;
  }

}
