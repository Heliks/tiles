import { OnInit } from './lifecycle';
import { GameBuilder } from './types';


/**
 * A bundle is a collection of game systems, services etc.
 *
 * Can use the `OnInit` lifecycle.
 *
 * @see OnInit
 */
export interface Bundle {

  /**
   * Called by the `GameBuilder` during the build process. Here the bundle registers its
   * systems, services, etc.
   *
   * @see GameBuilder
   */
  build(builder: GameBuilder): void;

}
