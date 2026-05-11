import { getEdgeDistance, computeLowerBound, makeTraceNode } from "./bb-utils";

export type DistanceMatrix = Array<Array<number | null>>;

const INF = Number.POSITIVE_INFINITY;

export type BranchStatus = "expanded" | "pruned" | "solution";

export type BranchTraceNode = {
  id: number;
  parentId: number | null;
  depth: number;
  status: BranchStatus;
  path: number[];
  pathLabels: string[];
  cost: number;
  bound: number;
  message: string;
};

export type BranchAndBoundInput = {
  startIndex: number;
  endIndex: number;
  labels: string[];
  distances: DistanceMatrix;
};

export type BranchAndBoundResult = {
  bestPath: number[];
  bestPathLabels: string[];
  bestCost: number | null;
  steps: BranchTraceNode[];
  visitedNodes: number;
  prunedNodes: number;
};

export function solveRouteWithBranchAndBound({
  startIndex,
  endIndex,
  labels,
  distances,
}: BranchAndBoundInput): BranchAndBoundResult {
  const totalNodes = labels.length;

  if (totalNodes < 2) {
    return {
      bestPath: [],
      bestPathLabels: [],
      bestCost: null,
      steps: [],
      visitedNodes: 0,
      prunedNodes: 0,
    };
  }

  if (
    startIndex < 0 ||
    endIndex < 0 ||
    startIndex >= totalNodes ||
    endIndex >= totalNodes ||
    startIndex === endIndex
  ) {
    return {
      bestPath: [],
      bestPathLabels: [],
      bestCost: null,
      steps: [],
      visitedNodes: 0,
      prunedNodes: 0,
    };
  }

  const steps: BranchTraceNode[] = [];
  let bestCost = INF;
  let bestPath: number[] = [];
  let visitedNodes = 0;
  let prunedNodes = 0;

  let sequence = 0;
  const nextId = () => {
    sequence += 1;
    return sequence;
  };

  const rootPath = [startIndex];
  const rootBound = computeLowerBound(
    distances,
    rootPath,
    endIndex,
    0,
    totalNodes,
  );

  const rootId = nextId();
  steps.push(
    makeTraceNode({
      id: rootId,
      parentId: null,
      path: rootPath,
      labels,
      cost: 0,
      bound: rootBound,
      status: "expanded",
      message: "Start node expanded.",
    }),
  );

  type QueueNode = {
    traceId: number;
    path: number[];
    cost: number;
    bound: number;
  };

  const queue: QueueNode[] = [
    {
      traceId: rootId,
      path: rootPath,
      cost: 0,
      bound: rootBound,
    },
  ];

  while (queue.length > 0) {
    queue.sort((a, b) => a.bound - b.bound);
    const node = queue.shift();
    if (!node) break;

    visitedNodes += 1;

    if (node.bound >= bestCost) {
      prunedNodes += 1;
      steps.push(
        makeTraceNode({
          id: nextId(),
          parentId: node.traceId,
          path: node.path,
          labels,
          cost: node.cost,
          bound: node.bound,
          status: "pruned",
          message: "Pruned: lower bound is not better than current best.",
        }),
      );
      continue;
    }

    const visited = new Set(node.path);
    const remainingIntermediate = Array.from(
      { length: totalNodes },
      (_, idx) => idx,
    ).filter((idx) => !visited.has(idx) && idx !== endIndex);

    const last = node.path[node.path.length - 1];

    if (remainingIntermediate.length === 0) {
      const tail = getEdgeDistance(distances, last, endIndex);
      if (tail !== INF) {
        const candidateCost = node.cost + tail;
        const candidatePath = [...node.path, endIndex];

        if (candidateCost < bestCost) {
          bestCost = candidateCost;
          bestPath = candidatePath;
          steps.push(
            makeTraceNode({
              id: nextId(),
              parentId: node.traceId,
              path: candidatePath,
              labels,
              cost: candidateCost,
              bound: candidateCost,
              status: "solution",
              message: "Accepted: new best complete route found.",
            }),
          );
        } else {
          prunedNodes += 1;
          steps.push(
            makeTraceNode({
              id: nextId(),
              parentId: node.traceId,
              path: candidatePath,
              labels,
              cost: candidateCost,
              bound: candidateCost,
              status: "pruned",
              message: "Rejected: complete route is worse than current best.",
            }),
          );
        }
      } else {
        prunedNodes += 1;
        steps.push(
          makeTraceNode({
            id: nextId(),
            parentId: node.traceId,
            path: [...node.path, endIndex],
            labels,
            cost: INF,
            bound: INF,
            status: "pruned",
            message: "Rejected: no valid road path to destination.",
          }),
        );
      }
      continue;
    }

    const orderedChildren = remainingIntermediate
      .map((nextIndex) => ({
        nextIndex,
        edgeCost: getEdgeDistance(distances, last, nextIndex),
      }))
      .sort((a, b) => a.edgeCost - b.edgeCost);

    for (const child of orderedChildren) {
      const childPath = [...node.path, child.nextIndex];
      const childCost = node.cost + child.edgeCost;

      if (!Number.isFinite(childCost)) {
        prunedNodes += 1;
        steps.push(
          makeTraceNode({
            id: nextId(),
            parentId: node.traceId,
            path: childPath,
            labels,
            cost: INF,
            bound: INF,
            status: "pruned",
            message: "Rejected: no valid road path on this branch.",
          }),
        );
        continue;
      }

      const childBound = computeLowerBound(
        distances,
        childPath,
        endIndex,
        childCost,
        totalNodes,
      );

      if (!Number.isFinite(childBound) || childBound >= bestCost) {
        prunedNodes += 1;
        steps.push(
          makeTraceNode({
            id: nextId(),
            parentId: node.traceId,
            path: childPath,
            labels,
            cost: childCost,
            bound: childBound,
            status: "pruned",
            message: "Pruned: child bound cannot improve best route.",
          }),
        );
        continue;
      }

      const childId = nextId();
      steps.push(
        makeTraceNode({
          id: childId,
          parentId: node.traceId,
          path: childPath,
          labels,
          cost: childCost,
          bound: childBound,
          status: "expanded",
          message: "Expanded: promising branch kept for search.",
        }),
      );

      queue.push({
        traceId: childId,
        path: childPath,
        cost: childCost,
        bound: childBound,
      });
    }
  }

  return {
    bestPath,
    bestPathLabels: bestPath.map((i) => labels[i] ?? `Node ${i}`),
    bestCost: Number.isFinite(bestCost) ? bestCost : null,
    steps,
    visitedNodes,
    prunedNodes,
  };
}
