import { Entity, World } from '@heliks/tiles-engine';

export interface Executable {
  exec(world: World, entity: Entity): void;
}

export class Executables extends Map<string, Executable> {}
