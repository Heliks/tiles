import { Constants } from './constants';
import { Line } from './line';
import { Node } from './node';
import { Rect } from './rect';
import { calculateAlignOffset, Display, isRow } from './style';

/* eslint-disable */
// Todo: Do not look here everything is WIP

/** @see https://www.w3.org/TR/css-flexbox-1/#algo-available */
export function determineAvailableSpace(node: Node, space: Rect): Rect {
  node.constants.space.width = node.style.size.width.resolve(space.width, space.width) - node.constants.margin.horizontal() - node.constants.padding.horizontal();
  node.constants.space.height = node.style.size.height.resolve(space.height, space.height) - node.constants.margin.vertical() - node.constants.padding.vertical();

  return node.constants.space;
}

export function setupConstants(node: Node): void {
  node.constants.align = node.style.align;
  node.constants.justify = node.style.justify;
  node.constants.wrap = node.style.wrap;

  node.constants.isRow = isRow(node.style.direction);

  // Completely reset size, needs to be determined by the algorithm.
  node.constants.size.width = undefined;
  node.constants.size.height = undefined;

  node.constants.padding.copy(node.style.padding);
  node.constants.margin.copy(node.style.margin);

  // Reset cached flex lines.
  for (const line of node.constants.lines) {
    line.reset();
  }
}



/** @internal */
function calculateBaseLines(node: Node, constants: Constants): void {
  for (const child of node.children) {
    child.constants.baseline = child.size.cross(constants.isRow);
  }
}

/** @internal */
function maxBaseLineReducer(max: number, node: Node): number {
  return Math.max(max, node.constants.baseline);
}

/** @see https://www.w3.org/TR/css-flexbox-1/#algo-cross-line */
export function calculateLineCrossSizes(constants: Constants): void {
  const cross = constants.size.cross(constants.isRow);

  // If the flex container is single-line and has a definite cross size, the cross size
  // of the flex line is the flex container’s inner cross size.
  if (constants.lines.length === 1 && cross !== undefined) {
    constants.lines[0].size.setCross(constants.isRow, cross);
  }
  else {
    // 1. Collect all the flex items whose inline-axis is parallel to the main-axis, whose
    // align-self is baseline, and whose cross-axis margins are both non-auto. Find the
    // largest of the distances between each item’s baseline and its hypothetical outer
    // cross-start edge, and the largest of the distances between each item’s baseline
    // and its hypothetical outer cross-end edge, and sum these two values.

    // 2. Among all the items not collected by the previous step, find the largest outer
    // hypothetical cross size.

    // 3. The used cross-size of the flex line is the largest of the numbers found in the
    // previous two steps and zero.
    for (const line of constants.lines) {
      const maxBaseLine = line.nodes.reduce(maxBaseLineReducer, 0);

      let highest = 0;

      for (const child of line.nodes) {
        const cross = maxBaseLine - child.constants.baseline + child.size.cross(constants.isRow);

        if (cross > highest) {
          highest = cross;
        }
      }

      line.size.setCross(constants.isRow, maxBaseLine);
    }
  }
}

/** @internal */
function getLineAt(idx: number, constants: Constants): Line {
  let line = constants.lines[idx];

  if (! line) {
    // Create flex line and cache it in manifest.
    line = constants.lines[idx] = new Line();
  }

  return line;
}

/**
 * Collects all children of `node` into {@link Line lines}.
 *
 * All items must have their hypothetical main size measured.
 *
 * @param node Flex items of this node will be collected into flex lines.
 * @param space Available space for individual lines to take.
 */
export function collectLines(node: Node, space: Rect): Line[] {
  const available = space.main(node.constants.isRow);

  let lineIdx = 0;
  let nodeIdx = 0;

  while (nodeIdx < node.children.length) {
    const child = node.children[nodeIdx];

    // Skip children that are `display:none` entirely.
    if (child.style.display === Display.None) {
      nodeIdx++;
      continue;
    }

    const line = getLineAt(lineIdx, node.constants);
    const main = child.constants.outerSize.main(node.constants.isRow);

    // Calculate the size of the line as if the node was added to it.
    const newLineMainSize = line.size.main(node.constants.isRow) + main;

    // If the container is single-line, collect all items into a single line. Otherwise,
    // starting from the first uncollected item, collect consecutive items one by one
    // until the first time that the next collected item would not fit into the container
    // main size.
    if (line.nodes.length > 0 && node.constants.wrap && newLineMainSize > available) {
      lineIdx++;

      continue;
    }

    line.size.setMain(node.constants.isRow, newLineMainSize);
    line.add(child);

    nodeIdx++;
  }

  return node.constants.lines;
}

export function determineLinesCrossSize(lines: Line[], constants: Constants) {
  let max = 0;

  for (const line of lines) {
    const cross = line.size.cross(constants.isRow);

    if (cross > max) {
      max = cross;
    }
  }
}

/**
 * Determines the main size of a container.
 *
 * @param lines Container lines.
 * @param constants Container constants.
 */
export function determineContainerMainSize(lines: Line[], constants: Constants): number {
  if (lines.length === 1) {
    return lines[0].size.main(constants.isRow);
  }
  else if (lines.length === 0) {
    return 0;
  }

  let longest = lines[0];
  let longestMain = lines[0].size.main(constants.isRow)

  // Note: We start at 1 because line 0 is always "longest" initially.
  for (let i = 1, l = lines.length; i < l; i++) {
    const line = lines[i];
    const main = line.size.main(constants.isRow);

    if (main > longestMain) {
      longest = line;
      longestMain = main;
    }
  }

  return longestMain;
}

function determineContainerCrossSize(lines: Line[], constants: Constants) {
  let cross = 0;

  for (const line of lines) {
    cross += line.size.cross(constants.isRow);
  }

  return cross;
}

function distributeRemainingCrossSpace(lines: Line[], space: Rect, constants: Constants): void {
  // First pass: Determine available cross space.
  let used = 0;

  for (const line of lines) {
    used += line.size.cross(constants.isRow);
  }

  const available = space.cross(constants.isRow) - used;

  // Second pass: Distribute space
  used = 0;

  for (const line of lines) {
    for (const child of line.nodes) {
      child.constants.offset.cross = used;
    }

    used += line.size.cross(constants.isRow)
  }
}

/**
 * Distributes remaining space to all flex items of the provided flex lines.
 *
 * @param lines Flex lines in which remaining space should be distributed among its nodes.
 * @param space Total available space.
 * @param constants Computed constants of the flex container.
 */
export function distributeAvailableSpace(lines: Line[], space: Rect, constants: Constants): void {
  let mainSpaceInUse = 0;
  let crossSpaceInUse = 0;

  for (const line of lines) {
    const freeMainSpace = space.main(constants.isRow) - line.size.main(constants.isRow);
    const availableCrossSpace = space.cross(constants.isRow);

    mainSpaceInUse = 0;

    for (let i = 0, l = line.nodes.length; i < l; i++) {
      const child = line.nodes[i];
      const first = i === 0;

      const freeCrossSpace = availableCrossSpace - child.size.cross(constants.isRow);

      const mainPos = calculateAlignOffset(freeMainSpace, l, first, constants.justify) + mainSpaceInUse;
      const crossPos = calculateAlignOffset(freeCrossSpace, l, first, constants.align) + crossSpaceInUse;

      if (constants.isRow) {
        // Todo: Should we get child margin from child constants?
        child.pos.x = mainPos + child.style.margin.left + constants.padding.left;
        child.pos.y = crossPos + child.style.margin.top + constants.padding.top;
      }
      else {
        child.pos.x = crossPos + child.style.margin.left + constants.padding.left;
        child.pos.y = mainPos + child.style.margin.top + constants.padding.top;
      }

      mainSpaceInUse += child.constants.outerSize.main(constants.isRow);
    }

    crossSpaceInUse += line.size.cross(constants.isRow);
  }
}

export function calculateOuterNodeSize(node: Node): Rect {
  node.constants.outerSize.width = node.size.width + node.constants.margin.horizontal();
  node.constants.outerSize.height = node.size.height + node.constants.margin.vertical();

  return node.constants.outerSize;
}

export function compute(node: Node, space: Rect) {
  // If the node has display: none, set size to 0 and exit early.
  if (node.style.display === Display.None) {
    node.constants.size.width = 0;
    node.constants.size.height = 0;

    return;
  }

  setupConstants(node);

  node.constants.size.width = node.style.size.width.resolve(space.width);
  node.constants.size.height = node.style.size.height.resolve(space.height);

  const available = determineAvailableSpace(node, space);

  // Compute children to determine their sizes.
  for (const child of node.children) {
    compute(child, available);
  }

  const lines = collectLines(node, available);

  let main = node.constants.size.main(node.constants.isRow);
  let cross = node.constants.size.cross(node.constants.isRow);

  // If needed, calculate main size.
  if (main === undefined) {
    main = determineContainerMainSize(lines, node.constants);
    node.constants.size.setMain(node.constants.isRow, main);
  }

  // 7. Determine the hypothetical cross size of each item by performing layout with
  // the used main size and the available space, treating auto as fit-content.

  // 8. Calculate the cross size of each flex line.
  calculateLineCrossSizes(node.constants);

  if (cross === undefined) {
    cross = determineContainerCrossSize(lines, node.constants);
    node.constants.size.setCross(node.constants.isRow, cross);
  }

  // Safety: At this point both width and height should be set.
  node.size.width = node.constants.size.width!;
  node.size.height = node.constants.size.height!;

  calculateOuterNodeSize(node);

  distributeAvailableSpace(lines, node.size, node.constants);
  // distributeRemainingCrossSpace(lines, node.size, node.constants);

  // Todo: This is not really in line with the spec, but we can set this here because
  //  currently all items participate in baseline alignment.
  node.constants.baseline = node.size.height;
}
