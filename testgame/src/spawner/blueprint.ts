import { EntityBuilder } from "@heliks/tiles-engine";

// Todo: This whole blueprint system is a placeholder for entity prefabs and component
//  deserialization.
export abstract class Blueprint {

  constructor(public spritesheet: string) {}

  abstract create(entity: EntityBuilder): void;

}
