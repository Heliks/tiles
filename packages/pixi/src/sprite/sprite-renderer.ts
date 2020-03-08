import { ProcessingSystem, World } from '@tiles/engine';
import { Query, System } from '@tiles/entity-system';
import { Injectable } from '@tiles/injector';
import { Camera } from '../camera';
import { Container } from 'pixi.js';
import { Renderer } from '../renderer';
import { Stage } from '../stage';
import Transform = PIXI.Transform;

@Injectable()
export class SpriteRenderer extends ProcessingSystem {

  constructor(
    public readonly renderer: Renderer,
    public readonly stage: Stage
  ) {
    super();
  }

  /** {@inheritDoc} */
  public getQuery(): Query {
    return {
      contains: [
        Camera,
        Transform
      ]
    };
  }

  /** {@inheritDoc} */
  public update(world: World): void {


    // const $camera = world.storage(Camera);

    // for (const entity of this.group.entities) {
    //   const camera = $camera.get(entity);
    // }
  }

}
