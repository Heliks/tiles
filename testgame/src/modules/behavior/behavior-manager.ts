import { Injectable } from '@heliks/tiles-engine';
import { BehaviorId } from './behavior';
import { MonoBehavior } from './mono-behavior';

/** Manager to register `MonoBehavior` instances. */
@Injectable()
export class BehaviorManager extends Map<BehaviorId, MonoBehavior<unknown>> {}
