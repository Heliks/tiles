import { Line } from './line';
import { Point } from './point';
import { Rect } from './rect';
import { AlignContent } from './style';
import { Maybe } from './types';


/**
 * Caches intermediate computations during layout computation. This class is considered
 * internal and should not be edited from outside the layout algorithm.
 */
export class Constants {

  public align = AlignContent.Start;
  public baseline = 0;
  public justify = AlignContent.Start;
  public isRow = true;
  public readonly lines: Line[] = [];
  public readonly margin = new Rect(0, 0);
  public readonly offset = new Point();
  public readonly outerSize = new Rect(0, 0);

  /**
   * Contains the computed size of the node in px.
   *
   * At the beginning of the computation this is always empty. The layout algorithm will
   * progressively determine the size for each side of the box during the different
   * computation steps.
   */
  public readonly size = new Rect<Maybe<number>>(undefined, undefined);
  public readonly space = new Rect(0, 0);
  public wrap = false;

}

