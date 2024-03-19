import 'reflect-metadata';

import { setTypeId } from '@heliks/ecs-serialize';
import { Circle, Rectangle, Vec2 } from '@heliks/tiles-math';
import { Transform } from './transform';

// Manually assign type IDs to serialize-able types that we import from 3rd party libs.
setTypeId(Transform, '40998bd2-b2cc-4a13-b2e1-c52f70d67970');
setTypeId(Rectangle, '18a2a202-fbec-41d0-b087-0f27750fc895');
setTypeId(Circle, 'ecc77b07-be84-4107-92ce-23894d6b6066');
setTypeId(Vec2, 'd2eb9ea9-c1f8-4a42-9e51-ce23210c1d26');

// Directories
export * from './app';
export * from './core';
export * from './ecs';
export * from './serialize';
export * from './transform';
export * from './utils';

// Files
export * from './screen';

// Re-export core-packages.
export * from '@heliks/event-queue';
export * from '@heliks/tiles-math';
export * from '@heliks/tiles-injector';

