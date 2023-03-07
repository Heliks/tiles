import { runtime, Screen, TransformBundle, Vec2, World } from '@heliks/tiles-engine';
import { FlexDirection, Style } from '../style';
import { FlexCompositor } from '../flex-compositor';
import { UiNode } from '../../ui-node';
import { Rectangle } from 'pixi.js';
import { Size } from '../size';


describe('FlexCompositor', () => {
  const SCREEN_W = 500;
  const SCREEN_H = 250;

  let compositor: FlexCompositor;
  let world: World;

  beforeEach(() => {
    world = runtime()
      .bundle(new TransformBundle())
      .component(Style)
      .component(UiNode)
      .provide({
        token: Screen,
        value: new Screen(new Vec2(
          SCREEN_W,
          SCREEN_H
        ))
      })
      .provide(FlexCompositor)
      .build()
      .world;

    compositor = world.get(FlexCompositor);
  });

  it.each([
    {
      direction: FlexDirection.Row,
      expected: SCREEN_W
    },
    {
      direction: FlexDirection.Column,
      expected: SCREEN_H
    }
  ])('should return size of the main axis when flex direction is $direction', (data) => {
    const size = compositor.getMainAxisSize(
      new Style({
        direction: data.direction
      })
    );

    expect(size).toBe(data.expected);
  });

  it.each([
    {
      direction: FlexDirection.Row,
      expected: SCREEN_H
    },
    {
      direction: FlexDirection.Column,
      expected: SCREEN_W
    }
  ])('should return size of the cross axis when flex direction is $direction', (data) => {
    const size = compositor.getCrossAxisSize(
      new Style({
        direction: data.direction
      })
    );

    expect(size).toBe(data.expected);
  });

  describe('when calculating content item bounds', () => {
    let node: UiNode;

    beforeEach(() => {
      node = new UiNode();

      // Report container bounds to 50x50px
      node.container.getLocalBounds = jest
        .fn()
        .mockImplementation((out = new Rectangle()) => {
          out.width = 50;
          out.height = 50

          return out;
        });
    });

    it('should use container bounds', () => {
      const entity = world.create(node);
      const bounds = compositor.getContentItemBounds(entity, node, new Style());

      expect(bounds).toMatchObject({
        width: 50,
        height: 50
      });
    });

    it('should use style bounds with px values', () => {
      const entity = world.create(
        node,
        new Style({
          width: Size.px(25),
          height: Size.px(75)
        })
      );

      const bounds = compositor.getContentItemBounds(entity, node, new Style());

      expect(bounds).toMatchObject({
        width: 25,
        height: 75
      });
    });

    it('should use style bounds with percentage values', () => {
      const entity = world.create(
        node,
        new Style({
          width: Size.percent(0.5),
          height: Size.percent(0.5)
        })
      );

      const bounds = compositor.getContentItemBounds(entity, node, new Style());

      expect(bounds).toMatchObject({
        width: (SCREEN_W / 2),
        height: (SCREEN_H / 2)
      });
    });
  });

});
