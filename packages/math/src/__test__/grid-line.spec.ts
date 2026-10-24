import { GridLine } from '../grid-line';
import { XY } from '../vec2';


function collect(line: GridLine): XY[] {
  const points: XY[] = [];

  // Fail instead of hanging the test suite if traversal stops terminating.
  for (let count = 0; count < 100; count++) {
    if (! line.next()) {
      return points;
    }

    points.push(line.toPoint());
  }

  throw new Error('Line did not finish within 100 tiles');
}

describe('GridLine', () => {
  let gridLine: GridLine;

  beforeEach(() => {
    gridLine = new GridLine();
  });

  describe('reset()', () => {
    it('should initialize the grid line with starting and ending points', () => {
      gridLine.reset(0, 0, 5, 5);

      expect(gridLine.x).toBe(0);
      expect(gridLine.y).toBe(0);
    });
  });

  describe('next()', () => {
    it('should return true and keep the initial position on the first call', () => {
      gridLine.reset(1, 1, 3, 3);

      const result = gridLine.next();

      expect(result).toBe(true);
      expect(gridLine.x).toBe(1);
      expect(gridLine.y).toBe(1);
    });

    it('should traverse toward the end point after the initial position', () => {
      gridLine.reset(2, 2, 5, 5);

      gridLine.next(); // First call to remain at the start
      gridLine.next(); // Move to the next step

      expect(gridLine.x).toBe(3);
      expect(gridLine.y).toBe(3);
    });

    it('should return false after reaching the end point', () => {
      gridLine.reset(0, 0, 2, 2);

      gridLine.next(); // Start
      gridLine.next(); // 1, 1
      gridLine.next(); // 2, 2

      // End
      const result = gridLine.next();

      expect(result).toBe(false);
    });

    it.each([
      {
        target: { x: 5, y: 2 },
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 1 },
          { x: 3, y: 1 },
          { x: 4, y: 2 },
          { x: 5, y: 2 }
        ]
      },
      {
        target: { x: 2, y: 5 },
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 1, y: 3 },
          { x: 2, y: 4 },
          { x: 2, y: 5 }
        ]
      },
      {
        target: { x: -2, y: 5 },
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: -1, y: 2 },
          { x: -1, y: 3 },
          { x: -2, y: 4 },
          { x: -2, y: 5 }
        ]
      },
      {
        target: { x: -5, y: 2 },
        points: [
          { x: 0, y: 0 },
          { x: -1, y: 0 },
          { x: -2, y: 1 },
          { x: -3, y: 1 },
          { x: -4, y: 2 },
          { x: -5, y: 2 }
        ]
      },
      {
        target: { x: -5, y: -2 },
        points: [
          { x: 0, y: 0 },
          { x: -1, y: 0 },
          { x: -2, y: -1 },
          { x: -3, y: -1 },
          { x: -4, y: -2 },
          { x: -5, y: -2 }
        ]
      },
      {
        target: { x: -2, y: -5 },
        points: [
          { x: 0, y: 0 },
          { x: 0, y: -1 },
          { x: -1, y: -2 },
          { x: -1, y: -3 },
          { x: -2, y: -4 },
          { x: -2, y: -5 }
        ]
      },
      {
        target: { x: 2, y: -5 },
        points: [
          { x: 0, y: 0 },
          { x: 0, y: -1 },
          { x: 1, y: -2 },
          { x: 1, y: -3 },
          { x: 2, y: -4 },
          { x: 2, y: -5 }
        ]
      },
      {
        target: { x: 5, y: -2 },
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: -1 },
          { x: 3, y: -1 },
          { x: 4, y: -2 },
          { x: 5, y: -2 }
        ]
      },
      {
        target: { x: 3, y: 0 },
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 }
        ]
      },
      {
        target: { x: 0, y: 3 },
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
          { x: 0, y: 3 }
        ]
      },
      {
        target: { x: 4, y: 4 },
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 3, y: 3 },
          { x: 4, y: 4 }
        ]
      }
    ])('should traverse line towards $target.x, $target.y', data => {
      gridLine.reset(0, 0, data.target.x, data.target.y);

      const result = collect(gridLine);

      expect(result).toEqual(data.points);
    });
  });
});
