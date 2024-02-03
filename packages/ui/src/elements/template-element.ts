import { Entity, Hierarchy, Parent, World } from '@heliks/tiles-engine';
import { Element } from '../element';
import { OnInit } from '../lifecycle';
import { Input } from '../params';


export interface TemplateRenderer {
  render(world: World): Entity;
}

/**
 * Elements can be conditionally hidden with their
 */
export class TemplateElement implements Element, OnInit {

  /** Contains the root entity of the rendered template. */
  public root?: Entity;

  /** @internal */
  private _changed = false;

  /** @internal */
  private _expression = false;

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

  public render(world: World, entity: Entity): void {
    this.root = this.renderer.render(world);

    // The component node tree is always a child of this element.
    world.attach(this.root, new Parent(entity));
  }

  public destroy(world: World): void {
    if (this.root) {
      world.get(Hierarchy).destroy(world, this.root);
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
    }
  }

  /** @inheritDoc */
  public onInit(world: World, entity: Entity): void {
    this.apply(world, entity);
  }

  /** @inheritDoc */
  public update(world: World, entity: Entity): void {
    this.apply(world, entity);
  }

}
