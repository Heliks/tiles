import { Transform, World } from '@tiles/engine';
import { Handle } from '@tiles/assets';
import { SpriteDisplay, SpriteSheet } from '@tiles/pixi';
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
