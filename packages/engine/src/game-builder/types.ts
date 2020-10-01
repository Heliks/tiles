import { System } from '@heliks/ecs';
import { ClassType } from '../types';
import { Provider } from './provider';

export interface GameBuilder {
  provide(provider: Provider): this;
  system(system: ClassType<System>): this;
}

export interface Module {
  build(builder: GameBuilder): unknown;
}




