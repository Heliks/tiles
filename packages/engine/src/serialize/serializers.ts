import {
  EntitySerializer as BaseEntitySerializer,
  TypeSerializer as BaseTypeSerializer,
  TypeStore
} from '@heliks/ecs-serialize';
import { Injectable } from '@heliks/tiles-injector';


/** @inheritDoc */
@Injectable()
export class TypeSerializer extends BaseTypeSerializer {

  constructor(store: TypeStore) {
    super(store);
  }

}

/** @inheritDoc */
@Injectable()
export class EntitySerializer extends BaseEntitySerializer {

  constructor(types: TypeSerializer) {
    super(types);
  }

}

