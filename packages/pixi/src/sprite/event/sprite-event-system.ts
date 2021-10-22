import { contains, Entity, ReactiveSystem, Injectable, World, Storage } from '@heliks/tiles-engine';
import { SpriteDisplay } from '../display';
import { SpriteEvent } from './sprite-event';
import { Stage } from '../../stage';

@Injectable()
export class SpriteEventSystem extends ReactiveSystem {

  /** @internal */
  private cmpSpriteDisplay!: Storage<SpriteDisplay>;

  /** @internal */
  private cmpSpriteEvent!: Storage<SpriteEvent>;

  constructor(private readonly stage: Stage) {
    super(contains(SpriteDisplay, SpriteEvent));
  }

  /** @inheritDoc */
  public boot(world: World): void {
    super.boot(world);

    this.cmpSpriteDisplay = world.storage(SpriteDisplay);
    this.cmpSpriteEvent = world.storage(SpriteEvent);
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const sprite = this.cmpSpriteDisplay.get(entity)._sprite;
    const events = this.cmpSpriteEvent.get(entity);

    sprite.interactive = true;

    const onDown  = () => events.down.push(undefined);
    const onUp    = () => events.up.push(undefined);

    // PIXI.JS will handle the events internally, we just forward them to our event
    // queues. We do normalize some events however, so that the component works the
    // same for mobile and desktop environments.
    sprite
      .on('mousedown', onDown)
      .on('mouseup', onUp)
      .on('touchstart', onDown)
      .on('touchend', onUp);
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    // Todo: Need to investigate if we still need to un-listen to events.
    this.cmpSpriteDisplay.get(entity)._sprite.interactive = false;
  }

}
