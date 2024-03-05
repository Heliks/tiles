import { Constants } from './constants';
import { Line } from './line';
import { Node } from './node';
import { ImmutableRect, Rect } from './rect';
import { calculateAlignOffset, Display, isRow } from './style';
import { Option } from './types';

/* eslint-disable */
// Todo: Do not look here everything is WIP

/** @see https://www.w3.org/TR/css-flexbox-1/#algo-available */
export function determineAvailableSpace(node: Node, space: Rect): Rect {
  // If node has an inner size, use that. Otherwise, resolve style property against space
  // that is available to the node itself.
  const width = node.constants.size.width ?? node.style.size.width.resolve(space.width, space.width);
  const height = node.constants.size.height ?? node.style.size.height.resolve(space.height, space.height);

  node.constants.space.width = width - node.constants.margin.horizontal() - node.constants.padding.horizontal();
  node.constants.space.height = height - node.constants.margin.vertical() - node.constants.padding.vertical();

  return node.constants.space;
}

export function setupConstants(node: Node, space: Rect, known?: ImmutableRect<Option<number>>): void {
  node.constants.align = node.style.align;
  // node.constants.baseSize = 0;
  node.constants.frozen = false;
  node.constants.justify = node.style.justify;
  node.constants.wrap = node.style.wrap;
  node.constants.isRow = isRow(node.style.direction);

  // Reset initial size. If the dimension of a side is already known, use that value as
  // basis. If not, and the node has a fixed style, use that value instead.
  if (known) {
    node.constants.size.width = known.width ?? node.style.size.width.resolve(space.width);
    node.constants.size.height = known.height ?? node.style.size.height.resolve(space.height);
  }
  else {
    node.constants.size.width = node.style.size.width.resolve(space.width);
    node.constants.size.height = node.style.size.height.resolve(space.height);
  }

  node.constants.hypotheticalOuterSize.width = 0;
  node.constants.hypotheticalOuterSize.height = 0;

  node.constants.hypotheticalInnerSize.width = 0;
  node.constants.hypotheticalInnerSize.height = 0;

  node.constants.padding.copy(node.style.padding);
  node.constants.margin.copy(node.style.margin);

  // Reset cached flex lines.
  for (const line of node.constants.lines) {
    line.reset();
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
    for (const line of constants.lines) {
      // 1. Collect all the flex items whose inline-axis is parallel to the main-axis,
      // whose align-self is baseline, and whose cross-axis margins are both non-auto.
      // Find the largest of the distances between each item’s baseline and its
      // hypothetical outer cross-start edge, and the largest of the distances between
      // each item’s baseline and its hypothetical outer cross-end edge, and sum these
      // two values.
      // Todo: Baseline is not supported. All flex items participate as baseline.

      // 2. Among all the items not collected by the previous step, find the largest outer
      // hypothetical cross size.
      let max = 0;

      for (const child of line.nodes) {
        const cross = child.constants.hypotheticalOuterSize.cross(constants.isRow);

        if (cross > max) {
          max = cross;
        }
      }

      // 3. The used cross-size of the flex line is the largest of the numbers found in the
      // previous two steps and zero.
      line.size.setCross(constants.isRow, max);
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
    const main = child.constants.hypotheticalOuterSize.main(node.constants.isRow);

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

    // Note: This is not technically part of the spec (at this point) and is used later
    // to resolve flexible lengths of flex items. Handling this early will save us one
    // extra iteration. https://www.w3.org/TR/css-flexbox-1/#resolve-flexible-length
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

function getLinesCrossAxisSum(node: Node) {
  let cross = 0;

  for (const line of node.constants.lines) {
    cross += line.size.cross(node.constants.isRow);
  }

  return cross;
}

/**
 * 12. Distribute any remaining free space. For each flex line:
 *      - If the remaining free space is positive and at least one main-axis margin on
 *        this line is auto, distribute the free space equally among these margins.
 *        Otherwise, set all auto margins to zero.
*       - Align the items along the main-axis per justify-content.
 *
 *
 * 15. Determine the flex container’s used cross size:
 *      - If the cross size property is a definite size, use that, clamped by the used
 *        min and max cross sizes of the flex container.
 *      - Otherwise, use the sum of the flex lines' cross sizes, clamped by the used min
 *        and max cross sizes of the flex container.
 *
 * Todo: 'auto' margins are not supported, therefore all items are aligned along their
 *  main axis with justify-content.
 *
 * @see https://www.w3.org/TR/css-flexbox-1/#algo-main-align
 * @see https://www.w3.org/TR/css-flexbox-1/#algo-cross-container
 */
export function distributeAvailableSpace(node: Node, lines: Line[], space: Rect, constants: Constants): void {
  let usedMain = 0;
  let usedCross = 0;

  const isRow = node.constants.isRow;

  for (const line of lines) {
    const freeMain = space.main(isRow) - line.size.main(isRow);
    const availableCrossSpace = space.cross(isRow);

    usedMain = 0;

    for (let i = 0, count = line.nodes.length; i < count; i++) {
      const child = line.nodes[i];
      const first = i === 0;

      const freeCross = availableCrossSpace - child.size.cross(isRow);

      const offsetMain = calculateAlignOffset(freeMain, count, first, constants.justify) + usedMain;
      const offsetCross = calculateAlignOffset(freeCross, count, first, constants.align) + usedCross;

      if (isRow) {
        // Todo: Should we get child margin from child constants?
        child.pos.x = offsetMain + child.style.margin.left + constants.padding.left;
        child.pos.y = offsetCross + child.style.margin.top + constants.padding.top;
      }
      else {
        child.pos.x = offsetCross + child.style.margin.left + constants.padding.left;
        child.pos.y = offsetMain + child.style.margin.top + constants.padding.top;
      }

      usedMain += child.constants.outerSize.main(isRow);
    }

    usedCross += line.size.cross(isRow);
  }
}

function calculateOuterNodeSize(node: Node): Rect {
  node.constants.outerSize.width = node.size.width + node.constants.margin.horizontal();
  node.constants.outerSize.height = node.size.height + node.constants.margin.vertical();

  return node.constants.outerSize;
}

/**
 * Returns the available space to calculate the base size of a flex item that is a child
 * of the given `node`.
 *
 * @internal
 */
function getBaseSizeSpace(node: Node): Rect {
  const space = node.constants.measure as Rect;

  let main = node.constants.size.main(node.constants.isRow);
  let cross = node.constants.size.cross(node.constants.isRow);

  // During the base size calculation, the child will use the available space to resolve
  // percentages. Percentages should not contribute to the base size calculation of an
  // auto sized child, therefore, if the node size is not yet determined, the child does
  // not have a definite size, and therefore, the available space in that axis is 0.
  if (main === undefined) {
    main = 0;
  }
  else {
    main -= node.style.padding.main(node.constants.isRow);
  }

  if (cross === undefined) {
    cross = 0;
  }
  else {
    cross -= node.style.padding.cross(node.constants.isRow);
  }

  space.set(node.constants.isRow, main, cross);

  return space;
}

/** @see https://www.w3.org/TR/css-flexbox-1/#algo-main-item */
function determineBaseSizes(node: Node): void {
  const space = getBaseSizeSpace(node);
  const main = space.main(node.constants.isRow);

  for (const child of node.children) {
    let basis;

    // A. If the item has a definite used flex basis, that’s the flex base size.
    basis = child.style.basis.resolve(main);

    // B. Todo: Aspect ratios are not supported.
    // C. Handled in E.
    // D. Todo: Vertical writing modes are not supported.
    // E. Otherwise, size the item into the available space using its used flex basis in
    //    place of its main size, treating a value of content as max-content. If a cross
    //    size is needed to determine the main size (e.g. when the flex item’s main size
    //    is in its block axis) and the flex item’s cross size is auto and not definite,
    //    in this calculation use fit-content as the flex item’s cross size. The flex
    //    base size is the item’s resulting main size.
    if (basis === undefined) {
      basis = compute(child, space, true).main(node.constants.isRow);
    }

    child.constants.baseSize = basis;
    child.constants.innerBaseSize = basis - child.style.padding.main(node.constants.isRow);

    // When determining the flex base size, the item’s min and max main sizes are ignored
    // (no clamping occurs). Furthermore, the sizing calculations that floor the content
    // box size at zero when applying box-sizing are also ignored. (For example, an item
    // with a specified size of zero, positive padding, and box-sizing: border-box will
    // have an outer flex base size of zero—and hence a negative inner flex base size.)
    // Todo: All items are currently sited as if they were border box.

    // The hypothetical main size is the item’s flex base size clamped according to its
    // used min and max main sizes (and flooring the content box size at zero).
    // Todo: Min/Max size constraints are not supported.
    child.constants.hypotheticalInnerSize.setMain(node.constants.isRow, child.constants.baseSize);
    child.constants.hypotheticalOuterSize.setMain(node.constants.isRow, child.constants.baseSize + child.style.margin.main(node.constants.isRow));
  }
}

/** @see https://www.w3.org/TR/css-flexbox-1/#resolve-flexible-lengths */
function resolveFlexibleLengths(node: Node, line: Line) {
  // 1. Determine the used flex factor. Sum the outer hypothetical main sizes of all
  //    items on the line. If the sum is less than the flex container’s inner main
  //    size, use the flex grow factor for the rest of this algorithm; otherwise,
  //    use the flex shrink factor.

  // Note: The hypothetical main size of the line is already calculated in step 5.
  const factor = line.size.main(node.constants.isRow);

  // Safety: The main size is already calculated in step 4-6.
  const innerMainSize = node.constants.size.main(node.constants.isRow) as number
    - node.style.padding.main(node.constants.isRow);

  const growing = factor < innerMainSize;
  const shrinking = !growing;

  // 2. Size inflexible items. Freeze, setting its target main size to its hypothetical
  //    main size:
  //    - Any item that has a flex factor of zero
  //    - If using the flex grow factor: any item that has a flex base size
  //      greater than its hypothetical main size
  //    - If using the flex shrink factor: any item that has a flex base size
  //      smaller than its hypothetical main size
  // 3. Calculate initial free space. Sum the outer sizes of all items on the line, and
  //    subtract this from the flex container’s inner main size. For frozen items, use
  //    their outer target main size; for other items, use their outer flex base size.
  node.constants.initialFreeSpace = innerMainSize;

  for (const child of line.nodes) {
    const inner = child.constants.hypotheticalInnerSize.main(node.constants.isRow);

    child.constants.targetSize.setMain(node.constants.isRow, inner);

    if (
      child.style.grow === 0 &&
      child.style.shrink === 0 ||
      (growing && child.constants.baseSize > inner) ||
      (shrinking && child.constants.baseSize < inner)
    ) {
      node.constants.initialFreeSpace -= child.constants.hypotheticalOuterSize.main(node.constants.isRow);
      child.constants.frozen = true;
    }
    else {
      node.constants.initialFreeSpace -= child.constants.baseSize;
      line.unfrozen.push(child);
    }
  }

  // 4. Loop
  while(true) {
    // A. Check for flexible items. If all the flex items on the line are frozen,
    //    free space has been distributed; exit this loop.
    if (line.unfrozen.length === 0) {
      break;
    }

    // B. Calculate the remaining free space as for the initial free space, above. If
    //    the sum of the unfrozen flex items’ flex factors is less than one, multiply
    //    the initial free space by this sum. If the magnitude of this value is less
    //    than the magnitude of the remaining free space, use this as the remaining
    //    free space.
    let free = Math.max(0, innerMainSize);
    let factors = 0;

    for (const child of line.nodes) {
      if (child.constants.frozen) {
        free -= child.constants.hypotheticalOuterSize.main(node.constants.isRow);
      }
      else {
        free -= child.constants.baseSize;
        factors += growing ? child.style.grow : child.style.shrink;
      }
    }

    if (factors < 1) {
      free = Math.min(free, node.constants.initialFreeSpace * factors);
    }

    // C. Distribute free space proportional to the flex factors.
    //      If the remaining free space is zero
    //        Do nothing.
    if (free !== 0) {
      //  If using the flex grow factor:
      //    Find the ratio of the item’s flex grow factor to the sum of the flex grow
      //    factors of all unfrozen items on the line. Set the item’s target main size to
      //    its flex base size plus a fraction of the remaining free space proportional
      //    to the ratio.
      if (growing && factors > 0) {
        for (const child of line.unfrozen) {
          const space = free * (child.style.grow / factors);
          child.constants.targetSize.setMain(node.constants.isRow, child.constants.baseSize + space);
          // console.log('grow child', child.id, child.constants.baseSize + space)
        }
      }
      //  If using the flex shrink factor:
      //    For every unfrozen item on the line, multiply its flex shrink factor by its
      //    inner flex base size, and note this as its scaled flex shrink factor. Find the
      //    ratio of the item’s scaled flex shrink factor to the sum of the scaled flex
      //    shrink factors of all unfrozen items on the line. Set the item’s target main
      //    size to its flex base size minus a fraction of the absolute value of the
      //    remaining free space proportional to the ratio. Note this may result in a
      //    negative inner main size; it will be corrected in the next step.
      else if (shrinking && factors > 0) {
        let shrinkFactorsScaled = 0;

        for (const child of line.unfrozen) {
          shrinkFactorsScaled += child.style.shrink * child.constants.baseSize;
        }

        for (const child of line.unfrozen) {
          const space = free * (child.style.shrink * child.constants.baseSize / shrinkFactorsScaled);

          child.constants.targetSize.setMain(node.constants.isRow, child.constants.baseSize + space);
        }
      }
    }

    // D. Fix min/max violations. Clamp each non-frozen item’s target main size by its
    //    min and max main size properties. If the item’s target main size was made
    //    smaller by this, it’s a max violation. If the item’s target main size was #
    //    made larger by this, it’s a min violation.
    // Todo: Min/Max size constraints are not supported.

    // E. Freeze over-flexed items. The total violation is the sum of the adjustments
    //    from the previous step ∑(clamped size - unclamped size).

    // Note: Can be skipped until min/max size constraints are supported. Since no
    // clamping occurs in step D., no violations occur either. We can simply pretend
    // to freeze all items here and exit early.
    line.unfrozen.length = 0;
  }
}

/**
 * 7. Determine the hypothetical cross size of each item by performing layout with the
 * used main size and the available space, treating auto as fit-content.
 *
 * @see https://www.w3.org/TR/css-flexbox-1/#algo-cross-item
 */
function determineHypotheticalCrossSizes(node: Node, space: Rect, known?: Rect<Option<number>>): void {
  for (const child of node.children) {
    let cross = child.constants.size.cross(node.constants.isRow);
    
    const foo = Rect.option<number>();
    const _space = space.clone();

    // width: if constants.is_row { child.target_size.width.into() } else { child_cross },
    // height: if constants.is_row { child_cross } else { child.target_size.height.into() },

    // const main = child.constants.size.main(node.constants.isRow) as number;

    /*
    let main;

    if (known) {
      main = known.main(node.constants.isRow) ?? node.constants.space.main(node.constants.isRow);
    }
    else {
      main = node.constants.space.main(node.constants.isRow);
    }

     */

    // const main = (node.constants.size.main(node.constants.isRow) as number) - node.constants.padding.main(node.constants.isRow);

    const main = child.constants.targetSize.main(node.constants.isRow);

    if (node.constants.isRow) {
      _space.width = main;
      _space.height = child.constants.size.height ?? node.constants.space.height;

      foo.width = main;
      foo.height = cross;
    }
    else {
      _space.width = child.constants.size.width ?? node.constants.space.width;
      _space.height = main;

      foo.width = cross;
      foo.height = main;
    }


    /*
    Size {
      width: if is_row { child.target_size.width.into() } else { child_cross },
      height: if is_row { child_cross } else { child.target_size.height.into() },
    },
    Size {
      width: if is_row { container_size.main(dir).into() } else { available_space.width },
      height: if is_row { available_space.height } else { container_size.main(dir).into() },
    },
     */

    // Todo
    if (child.id === 2 || child.id === 1) {

    }

    // const before = child.constants.size.clone();
    const before = child.constants.size.main(node.constants.isRow);

    cross = compute(child, _space, false, foo, child.constants.size).cross(node.constants.isRow);

    // child.constants.size.copy(before);

    child.constants.size.setMain(node.constants.isRow, before)

    child.constants.hypotheticalInnerSize.setCross(node.constants.isRow, cross);
    child.constants.hypotheticalOuterSize.setCross(node.constants.isRow, cross + child.style.margin.cross(node.constants.isRow));
  }
}

/**
 * 11.  Determine the used cross size of each flex item. If a flex item has align-self:
 *      stretch, its computed cross size property is auto, and neither of its cross-axis
 *      margins are auto, the used outer cross size is the used cross size of its flex
 *      line, clamped according to the item’s used min and max cross sizes. Otherwise,
 *      the used cross size is the item’s hypothetical cross size.
 *
 * Todo: align-content: stretch is not supported, therefore all items will use their
 *  hypothetical cross size.
 *
 * @see https://www.w3.org/TR/css-flexbox-1/#algo-stretch
 */
function determineItemCrossSizes(node: Node): void {
  for (const child of node.children) {
    child.size.setCross(
      node.constants.isRow,
      child.constants.hypotheticalInnerSize.cross(node.constants.isRow)
    );
  }
}

function measure(node: Node, space: Rect): Rect {
  return compute(node, space, true);
}

export function compute(node: Node, space: Rect, measure = false, known?: Rect<Option<number>>, parentSize = Rect.option()): Rect<number> {
  setupConstants(node, space, known);

  // console.log(measure ? 'measure' : 'compute', node.id, space, known)

  // If we are only interested in measuring and size can be fully determined from node
  // style, exit early.
  if (measure && node.constants.size.width !== undefined && node.constants.size.height !== undefined) {
    node.size.width = node.constants.size.width;
    node.size.height = node.constants.size.height;

    return node.constants.size as Rect;
  }

  // 2. Determine the available main and cross space for the flex items.
  const available = determineAvailableSpace(node, space);

  // 3. Determine the flex base size and hypothetical main size of each item:
  determineBaseSizes(node);

  // 4. Determine the main size of the flex container
  // Todo: Don't re-calculate known axis.

  // 9.3. Main Size Determination
  // 5. Collect flex items into flex lines.
  const lines = collectLines(node, available);

  let main = node.constants.size.main(node.constants.isRow);
  let cross = node.constants.size.cross(node.constants.isRow);

  // Calculate container main size if it hasn't been determined yet.
  if (main === undefined) {
    main = determineContainerMainSize(lines, node.constants);
    node.constants.size.setMain(node.constants.isRow, main);
  }

  // 6. Resolve flexible lengths.
  for (const line of lines) {
    resolveFlexibleLengths(node, line);
  }

  // 9.4. Cross Size Determination
  // 7. Determine the hypothetical cross size of each item by performing layout with
  // the used main size and the available space, treating auto as fit-content.
  determineHypotheticalCrossSizes(node, available, known);

  // 8. Calculate the cross size of each flex line.
  calculateLineCrossSizes(node.constants);

  // Don't perform layout if we are only interested in measuring the node.
  if (! measure) {
    // 11. Determine the used cross size of each flex item.
    determineItemCrossSizes(node);

    // 12. Distribute any remaining free space.
    distributeAvailableSpace(node, lines, node.size, node.constants);
  }

  // 15. Determine the flex container’s used cross size:
  //     - If the cross size property is a definite size, use that, clamped by the used
  //       min and max cross sizes of the flex container.
  //     - Otherwise, use the sum of the flex lines' cross sizes, clamped by the used
  //       min and max cross sizes of the flex container.
  if (cross === undefined) {
    cross = getLinesCrossAxisSum(node);
    node.constants.size.setCross(node.constants.isRow, cross);
  }

  // 16. Align all flex lines per align-content.
  // This step is covered in 12.

  // Safety: At this point both width and height should be set.
  node.size.width = node.constants.size.width!;
  node.size.height = node.constants.size.height!;

  calculateOuterNodeSize(node);

  // distributeAvailableSpace(lines, node.size, node.constants);
  // distributeRemainingCrossSpace(lines, node.size, node.constants);

  // Todo: This is not really in line with the spec, but we can set this here because
  //  currently all items participate in baseline alignment.
  node.constants.baseline = node.size.height;

  return node.constants.size as Rect;
}


