import { Transform, World } from '@heliks/tiles-engine';
import { Handle } from '@heliks/tiles-assets';
import { SpriteDisplay, SpriteSheet } from '@heliks/tiles-pixi';
import { Health } from '../components/health';

/** Spawns a josh into the world. */
export function spawnJosh(world: World, sheet: Handle<SpriteSheet>, x: number, y: number): void {
  world
    .builder()
    .use(new Transform(x, y))
    .use(new Health(100, 100))
    .use(new SpriteDisplay(sheet, 0, 1))
    .build();
}
