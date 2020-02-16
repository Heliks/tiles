import 'reflect-metadata';
import { Container } from '@tiles/injector';
import { World } from '@tiles/entity-system';

export function foo() {
  console.log(new World());

  return new Container();
}
