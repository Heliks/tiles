import { World } from '../../ecs';
import { App } from '../app';
import { Builder } from '../builder';
import { Bundle } from '../bundle';
import { hasOnInit } from '../../ecs/lifecycle';
import { Task } from './task';


/** Adds {@link Bundle bundles} to the app. */
export class AddBundle<B extends Builder> implements Task {

  /**
   * @param bundle Instance of the bundle that should be added to the app.
   * @param builder App builder instance.
   */
  constructor(private readonly bundle: Bundle<B>, private readonly builder: B) {}

  /** @inheritDoc */
  public exec(app: App): void {
    this.bundle.build(this.builder);
    this.builder.exec(app);
  }

  /** @inheritDoc */
  public init(world: World): void {
    this.builder.init(world);

    if (hasOnInit(this.bundle)) {
      this.bundle.onInit(world);
    }
  }

  /** @internal */
  public toString(): string {
    return `Add Bundle: ${this.bundle.constructor.name}`;
  }

}
