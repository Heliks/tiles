class ItemManager {

}

const manager = new ItemManager();

export interface Item {
  id: number;
  spritesheet: string;
  sprite: number;
  name: string;
}

export class Inventory {

  public readonly items: Item[] = [];

  public add(item: Item): this {
    this.items.push(item);

    return this;
  }

  public remove(item: Item): this {
    return this;
  }

}




