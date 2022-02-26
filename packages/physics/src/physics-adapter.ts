import { ClassType, Bundle } from '@heliks/tiles-engine';
import { Physics } from './physics';


export interface PhysicsAdapter extends Bundle {

  /**
   * Returns the adapters implementation type for the `Physics` provider.
   *
   * If a type is returned instead of an instance, the provider will be instantiated
   * using the service container.
   */
  getPhysicsType(): Physics | ClassType<Physics>;

}
