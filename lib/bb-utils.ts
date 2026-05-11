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

  for (let i = 0; i < targets.length; i++) {
    const to = targets[i];
    if (from === to) continue;
    const dist = getEdgeDistance(distances, from, to);
    if (dist < best) best = dist;
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
  const lastNode = path[path.length - 1];

  // All nodes that are not visited and are not the destination
  const unvisited = [];
  for (let i = 0; i < totalNodes; i++) {
    if (i !== endIndex && !visited.has(i)) unvisited.push(i);
  }

  // If no more nodes to visit, just add cost to reach the end
  if (unvisited.length === 0) {
    const directCost = getEdgeDistance(distances, lastNode, endIndex);
    return directCost === INF ? INF : currentCost + directCost;
  }

  // Start with the actual cost so far
  let bound = currentCost;

  // Cheapest edge from the current last node to any unvisited node or the end
  const distanceFromLast = minOutgoingToSet(distances, lastNode, [
    ...unvisited,
    endIndex,
  ]);
  if (distanceFromLast === INF) return INF;
  bound += distanceFromLast;

  // For each unvisited node, cheapest edge to any other unvisited node or the end

  for (let i = 0; i < unvisited.length; i++) {
    const currentNode = unvisited[i];
    const remainingTargets = [...unvisited.filter((u) => u !== currentNode), endIndex];
    const minDistanceFromNode = minOutgoingToSet(distances, currentNode, remainingTargets);
    if (minDistanceFromNode === INF) return INF;
    bound += minDistanceFromNode;
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
