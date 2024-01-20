import { Attribute } from '../attribute';
import { Display } from '../layout';
import { Input } from '../params';
import { UiNode } from '../ui-node';


/**
 * A structural attribute that conditionally shows or hides an element based on the
 * value of an expression that is cast into a `boolean`. When the expression evaluates
 * to `true`, the element will be made visible. If it evaluates to `false`, it will
 * be hidden.
 */
export class ConditionAttribute implements Attribute {

  /**
   * This value will be cast into a boolean. If it valuates to `true`, the element will
   * be made visible. If it evaluates to `false`, it will be hidden.
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

  /** @inheritDoc */
  public update(node: UiNode): void {
    node.style.display = this.resolve() ? Display.Flex : Display.None;
  }

}