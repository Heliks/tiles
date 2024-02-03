import { Entity, World } from '@heliks/tiles-engine';
import { Attribute } from '../attribute';
import { Display } from '../layout';
import { OnInit } from '../lifecycle';
import { Input } from '../params';
import { UiNode } from '../ui-node';


/**
 * A structural attribute that conditionally shows or hides an element based on the
 * value of an expression that is cast into a `boolean`. When the expression evaluates
 * to `true`, the element will be made visible. If it evaluates to `false`, it will
 * be hidden.
 *
 * This does not remove the element from the layout tree. Therefore, it does not guard
 * against not-yet existing inputs that are supposed to be passed into the element at a
 * later time. For this case, a {@link TemplateElement} can be used to completely remove
 * an element from the layout tree conditionally.
 */
export class ConditionAttribute implements Attribute, OnInit {

  /**
   * Expression that will be evaluated to decide if the element should be hidden or
   * shown. If it evaluates to `true`, it will be shown. If it is `false`, it will
   * be hidden instead.
   */
  @Input()
  public expression?: unknown;

  /**
   * @param not If `true`, negates the evaluated {@link expression}.
   */
  constructor(public readonly not = false) {}

  /** @internal */
  private resolve(): boolean {
    return this.not ? !this.expression : Boolean(this.expression);
  }

  /** @internal */
  private apply(node: UiNode): void {
    node.style.display = this.resolve() ? Display.Flex : Display.None;
  }

  /** @inheritDoc */
  public onInit(world: World, entity: Entity): void {
    this.apply(world.storage(UiNode).get(entity));
  }

  /** @inheritDoc */
  public update(node: UiNode): void {
    this.apply(node);
  }

}
