import { Entity, Injectable, Transform, World } from '@heliks/tiles-engine';
import { AssetLoader, AssetStorage } from '@heliks/tiles-assets';
import { SpriteAnimation, SpriteDisplay, SpriteSheet } from '@heliks/tiles-pixi';
import { AsepriteFormat } from '@heliks/tiles-aseprite';
import { MapHierarchy } from '../world';
import { Blueprint } from './blueprint';

@Injectable()
export class SpawnerManager {

  private readonly blueprints = new Map<string, Blueprint>();

  /** @internal */
  private readonly storage: AssetStorage<SpriteSheet> = new Map();

  constructor(
    private readonly assets: AssetLoader,
    private readonly mapHierarchy: MapHierarchy
  ) {}

  public register(id: string, blueprint: Blueprint): this {
    this.blueprints.set(id, blueprint);

    return this;
  }

  private getBlueprint(id: string): Blueprint {
    const blueprint = this.blueprints.get(id);

    if (! blueprint) {
      throw new Error(`Invalid ID "${id}"`);
    }

    return blueprint;
  }

  public spawn(world: World, id: string, x = 0, y = 0): Entity {
    const blueprint = this.getBlueprint(id);

    // Todo: In the future sprite sheet handles should be cached to avoid re-loading
    //  the spritesheet every time it is spawned.
    const spritesheet = AsepriteFormat.load(world, blueprint.spritesheet);

    const entity = world
      .builder()
      .use(new Transform(x, y))
      .use(new SpriteDisplay(spritesheet, 1, this.mapHierarchy.layer2))
      .use(new SpriteAnimation().play('idle'));

    blueprint.create(entity);

    return entity.build();
  }

}
