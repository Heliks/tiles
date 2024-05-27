import { Node } from '../node';


describe('Node', () => {
  let node0: Node;
  let node1: Node;
  let node2: Node;
  let node3: Node;

  beforeEach(() => {
    node0 = new Node();
    node1 = new Node();
    node2 = new Node();
    node3 = new Node();
  });

  describe('when adding a child node', () => {
    it('should add child', () => {
      node0.append(node1);
      node0.append(node2);

      expect(node0.children).toEqual([
        node1,
        node2
      ]);
    });

    it('should assign parent', () => {
      node0.append(node1);

      expect(node1.parent).toBe(node0);
    });
  });

  describe('when adding a child at a specific array index', () => {
    it('should add child at correct position', () => {
      node0.append(node1);
      node0.append(node2);

      node0.appendAt(node3, 1);

      expect(node0.children).toEqual([
        node1,
        node3,
        node2
      ]);
    });

    it('should move child to index if it has been a child before', () => {
      node0.append(node1);
      node0.append(node2);
      node0.append(node3);

      node0.appendAt(node1, 2);

      expect(node0.children).toEqual([
        node2,
        node3,
        node1
      ]);
    });

    it('should assign parent', () => {
      node0.appendAt(node1, 0);

      expect(node1.parent).toBe(node0);
    });
  });

  describe('when removing a child', () => {
    it('should remove parent', () => {
      node0.append(node1);
      node0.remove(node1);

      expect(node1.parent).toBeUndefined();
    });
  });

  it('should insert node before child node', () => {
    node0.append(node1);
    node0.append(node2);

    node0.appendBefore(node1, node3);

    expect(node0.children).toEqual([
      node3,
      node1,
      node2
    ]);
  });

  it('should insert node after child node', () => {
    node0.append(node1);
    node0.append(node2);

    node0.appendAfter(node1, node3);

    expect(node0.children).toEqual([
      node1,
      node3,
      node2
    ]);
  });
});
