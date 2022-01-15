import { Circle } from '../circle';


describe('Circle', () => {
  it('should be scaled', () => {
    const circle = new Circle(5).scale(10);

    expect(circle.radius).toBe(50);
  });
});