import { Attribute } from './attribute';
import { ContextRef } from './context';


export class AttributeBinding<A extends Attribute = Attribute> {

  constructor(
    public readonly attribute: A,
    public readonly key: string,
    public readonly input?: string
  ) {}

  public resolve(host: ContextRef): void {
    if (this.input) {
      this.attribute[this.input as keyof A] = host.getInput(this.key) as A[keyof A];
    }
  }

}
