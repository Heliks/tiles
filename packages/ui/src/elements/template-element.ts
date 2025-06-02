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

  /**
   * The template will be rendered as long as this value evaluates to `true`, and
   * destroyed when it changes to `false`. If the expression is a function, it will
   * be called and its return value will be used instead.
   */
  @Input()
  public expression: unknown = false;

  /** @internal */
  private _expression = false;

  constructor(public readonly renderer: R) {}

  /** Renders the template if it isn't already rendered. */
  public render(world: World, entity: Entity): void {
    if (this.root !== undefined) {
      throw new Error('Component is already rendered.');
    }

    this.root = this.renderer.render(world, entity);
  }

  /** Destroys the rendered template, if any. */
  public destroy(world: World): void {
    if (this.root !== undefined) {
      world.get(Hierarchy).destroy(world, this.root);
      
      this.root = undefined;
      this._expression = false;
    }
  }

  /** Evaluates the template {@link expression}. */
  public evaluate(): boolean {
    return typeof this.expression === 'function' ? this.expression() : Boolean(this.expression);
  }

  public apply(world: World, entity: Entity): void {
    const expression = this.evaluate();

    // Expression has not changed. Exit early.
    if (expression === this._expression) {
      return;
    }

    this._expression = expression;

    if (this._expression) {
      this.render(world, entity);
    }
    else {
      this.destroy(world);
    }

    world.get(Document).invalidate();
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
