import { Entity, Hierarchy, World } from '@heliks/tiles-engine';
import { Element } from '../element';
import { Input } from '../input';
import { OnDestroy, OnInit } from '../lifecycle';
import { Document } from '../providers';


export interface TemplateRenderer {

  /**
   * Creates the entity hierarchy of UI nodes that make up the rendered template.
   *
   * @param world Entity world.
   * @param owner The entity that owns the {@link TemplateElement} that wants to
   *  render this template.
   */
  render(world: World, owner: Entity): Entity;

}

/**
 * Templates will be rendered as long as their {@link expression} evaluates to `true`,
 * and hidden if not. Hidden templates are removed from the layout tree, which results
 * in everything in the tree below the template node being destroyed.
 *
 * - `R`: Type of {@link TemplateRenderer} used to render the template.
 */
export class TemplateElement<R extends TemplateRenderer = TemplateRenderer> implements Element, OnInit, OnDestroy {

  /** Contains the root entity of the rendered template. */
  public root?: Entity;

  /** @internal */
  private _changed = false;

  /** @internal */
  private _expression = false;

  /**
   * Updates the template expression depending on if `value` evaluates to `true` or
   * to `false`. If `value` is a function, it will be called, and it's return value
   * will be used instead.
   */
  @Input()
  public set expression(value: unknown) {
    const expression = typeof value === 'function' ? value() : Boolean(value);

    if (expression !== this._expression) {
      this._changed = true;
      this._expression = expression;
    }
  }

  public get expression(): unknown {
    return this._expression;
  }

  constructor(public readonly renderer: R) {}

  /** @inheritDoc */
  public getContext(): object {
    return this;
  }

  public render(world: World, entity: Entity): void {
    if (this.root !== undefined) {
      throw new Error('Component is already rendered.');
    }

    this.root = this.renderer.render(world, entity);
  }

  public destroy(world: World): void {
    if (this.root !== undefined) {
      world.get(Hierarchy).destroy(world, this.root);

      this.root = undefined;
      this._changed = false;
      this._expression = false;
    }
  }

  public apply(world: World, entity: Entity): void {
    if (this._changed) {
      if (this._expression) {
        this.render(world, entity);
      }
      else {
        this.destroy(world);
      }

      // Changes were applied successfully.
      this._changed = false;

      world.get(Document).invalidate();
    }
  }

  /** @inheritDoc */
  public onInit(world: World, entity: Entity): void {
    this.apply(world, entity);
  }

  /** @inheritDoc */
  public onDestroy(world: World): void {
    this.destroy(world);
  }

  /** @inheritDoc */
  public update(world: World, entity: Entity): void {
    this.apply(world, entity);
  }

}
