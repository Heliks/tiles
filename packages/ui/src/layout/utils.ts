import { Rect } from './rect';
import { Size } from './size';


export function block(): Rect<Size> {
  return new Rect<Size>(
    Size.percent(1),
    Size.auto()
  );
}

export function fill(): Rect<Size> {
  return new Rect<Size>(
    Size.percent(1),
    Size.percent(1)
  );
}

export function auto(): Rect<Size> {
  return new Rect<Size>(
    Size.auto(),
    Size.auto()
  );
}

export function rect(size: number): Rect<Size> {
  return new Rect<Size>(
    Size.px(size),
    Size.px(size)
  );
}
