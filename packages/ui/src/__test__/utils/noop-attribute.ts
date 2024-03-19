import { Attribute } from '../../attribute';


export class NoopAttribute implements Attribute {
  update = jest.fn();
}
