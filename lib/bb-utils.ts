import type {
  BranchStatus,
  BranchTraceNode,
  DistanceMatrix,
} from "./branch-and-bound";

const INF = Number.POSITIVE_INFINITY;

export function getEdgeDistance(
  distances: DistanceMatrix,
  a: number,
  b: number,
): number {
  const forward = distances[a]?.[b];
  const backward = distances[b]?.[a];
  const candidates = [forward, backward].filter(
    (d): d is number => typeof d === "number" && Number.isFinite(d),
  );

  return candidates.length > 0 ? Math.min(...candidates) : INF;
}

export function minOutgoingToSet(
  distances: DistanceMatrix,
  from: number,
  targets: number[],
): number {
  let best = INF;

  for (const to of targets) {
    if (from === to) continue;
    const d = getEdgeDistance(distances, from, to);
    if (d < best) best = d;
  }

  return best;
}

export function computeLowerBound(
  distances: DistanceMatrix,
  path: number[],
  endIndex: number,
  currentCost: number,
  totalNodes: number,
): number {
  const visited = new Set(path);
  const last = path[path.length - 1];

  const unvisited = Array.from({ length: totalNodes }, (_, i) => i).filter(
    (i) => !visited.has(i) && i !== endIndex,
  );

  if (unvisited.length === 0) {
    const tail = getEdgeDistance(distances, last, endIndex);
    return tail === INF ? INF : currentCost + tail;
  }

  let bound = currentCost;

  const firstLegTargets = [...unvisited, endIndex];
  const firstLeg = minOutgoingToSet(distances, last, firstLegTargets);
  if (firstLeg === INF) return INF;
  bound += firstLeg;

  for (const node of unvisited) {
    const nextTargets = [...unvisited.filter((u) => u !== node), endIndex];
    const nodeBest = minOutgoingToSet(distances, node, nextTargets);
    if (nodeBest === INF) return INF;
    bound += nodeBest;
  }

  return bound;
}

export function makeTraceNode(args: {
  id: number;
  parentId: number | null;
  path: number[];
  labels: string[];
  cost: number;
  bound: number;
  status: BranchStatus;
  message: string;
}): BranchTraceNode {
  const { id, parentId, path, labels, cost, bound, status, message } = args;
  return {
    id,
    parentId,
    depth: Math.max(path.length - 1, 0),
    status,
    path,
    pathLabels: path.map((idx) => labels[idx] ?? `Node ${idx}`),
    cost,
    bound,
    message,
  };
}
