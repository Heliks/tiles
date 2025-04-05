import { Filter } from 'pixi.js';


/**
 * Materials can be applied to {@link Drawable drawables} to apply a specific kind of
 * coloring or geometry to it. Essentially, they are a collection of shaders.
 *
 * - `D`: Custom data for this material. This is the uniform(s) that can be passed to
 * the individual {@link filters}. Therefore, the data needs to be a valid format for
 * GLSL & serializable via `JSON.stringify()`.
 */
export interface ShaderMaterial {

  /**
   * Returns the PIXI {@link Filter} that will be applied to a {@link Drawable} when it
   * has this material assigned to it.
   */
  filters(): Filter[];

}

