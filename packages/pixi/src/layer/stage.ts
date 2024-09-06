import { Injectable, isDefined } from '@heliks/tiles-engine';
import { Drawable } from '../drawable';
import { Layer, LayerId } from './layer';
import { Layers } from './layers';


/**
 * The stage is a utility API that allows the insertion of {@link Drawable drawables}
 * into the appropriate renderer {@link Layers layers}. If no layers are specified,
 * the stage will place drawables into the first one available.
 */
@Injectable()
export class Stage {

  /**
   * @param layers {@see Layers}
   */
  constructor(private readonly layers: Layers) {}

  /**
   * Adds a {@link Drawable} to the stage.
   *
   * @param drawable Drawable to add.
   * @param layerId Id of the layer to which the drawable should be added. If undefined,
   *  the drawable will be added to the first available layer.
   * @returns The layer to which the drawable was added.
   */
  public add(drawable: Drawable, layerId?: LayerId): Layer {
    const layer = isDefined(layerId)
      ? this.layers.get(layerId)
      : this.layers.getAt(0);

    layer.add(drawable);

    return layer;
  }

  /** Removes a {@link Drawable drawable}. */
  public remove(drawable: Drawable): this {
    drawable.parent?.removeChild(drawable);

    return this;
  }

}


