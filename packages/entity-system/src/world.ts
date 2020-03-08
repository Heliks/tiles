import { Archetype } from './archetype';
import { BaseWorld } from './base-world';
import { EntityBuilder } from './entity-builder';

export class World extends BaseWorld {

  public builder(): EntityBuilder {
    return new EntityBuilder(this.create(), this);
  }

  /**
   * Returns an entity builder that can be used to build reoccurring entity
   * compositions (= "Archetype").
   */
  public archetype(): Archetype {
    return new Archetype(this);
  }

}

