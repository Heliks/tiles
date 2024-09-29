import 'reflect-metadata';

import { setTypeId } from '@heliks/ecs-serialize';
import { Circle, Rectangle, Vec2 } from '@heliks/tiles-math';
import { Transform } from './transform';

// Manually assign type IDs to serialize-able types that we import from 3rd party libs.
setTypeId(Transform, 'common.Transform');
setTypeId(Rectangle, 'math.Rectangle');
setTypeId(Circle, 'math.Circle');
setTypeId(Vec2, 'math.Vec2');

// Directories
export * from './app';
export * from './core';
export * from './ecs';
export * from './serialize';
export * from './transform';
export * from './utils';

// Re-export core-packages.
export * from '@heliks/event-queue';
export * from '@heliks/tiles-math';
export * from '@heliks/tiles-injector';

