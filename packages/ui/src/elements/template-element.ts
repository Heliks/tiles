import { Entity, Hierarchy, World } from '@heliks/tiles-engine';
import { Element } from '../element';
import { OnInit } from '../lifecycle';
import { Input } from '../params';


export interface TemplateRenderer {
  render(world: World): Entity;
}

/**
 * Templates will be rendered as long as their {@link expression} evaluates to `true`,
 * and hidden if not. Hidden templates are removed from the layout tree, which results
 * in everything in the tree below the template node being destroyed.
 */
export class TemplateElement implements Element, OnInit {

  /** Contains the root entity of the rendered template. */
  public root?: Entity;

  /** @internal */
  private _changed = false;

  /** @internal */
  private _expression = false;

  /**
   * Determines if the template should be shown or hidden. When the template is hidden,
   * it is removed from the layout tree entirely.
   */
  @Input()
  public set expression(value: unknown) {
    const expression = Boolean(value);

    if (expression !== this._expression) {
      this._changed = true;
      this._expression = expression;
    }
  }

  constructor(public readonly renderer: TemplateRenderer) {}

  /** @inheritDoc */
  public getContext(): object {
    return this;
  }

  public render(world: World): void {
    this.root = this.renderer.render(world);
  }

  public destroy(world: World): void {
    if (this.root) {
      world.get(Hierarchy).destroy(world, this.root);
    }
  }

  public apply(world: World): void {
    if (this._changed) {
      if (this._expression) {
        this.render(world);
      }
      else {
        this.destroy(world);
      }

      // Changes were applied successfully.
      this._changed = false;
    }
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    this.apply(world);
  }

  /** @inheritDoc */
  public update(world: World): void {
    this.apply(world);
  }

}
