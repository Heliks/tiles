import { Line } from './line';
import { Point } from './point';
import { Rect } from './rect';
import { AlignContent } from './style';
import { Maybe } from './types';


/**
 * Caches computations during the various step of the layout algorithm. Any value here
 * is considered internal and should not be edited manually.
 */
export class Constants {

  /** Offset in cross axis direction. */
  public baseline = 0;

  public align = AlignContent.Start;
  public justify = AlignContent.Start;
  public isRow = true;
  public readonly lines: Line[] = [];
  public readonly offset = new Point();
  public readonly size = new Rect<Maybe<number>>(undefined, undefined);
  public readonly space = new Rect(0, 0);
  public wrap = false;

}

