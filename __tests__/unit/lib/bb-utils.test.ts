import {
  getEdgeDistance,
  minOutgoingToSet,
  computeLowerBound,
  makeTraceNode,
} from "@/lib/bb-utils";
import type { DistanceMatrix } from "@/lib/branch-and-bound";

const INF = Number.POSITIVE_INFINITY;

describe("getEdgeDistance", () => {
  const matrix: DistanceMatrix = [
    [0, 10, INF],
    [10, 0, 20],
    [INF, 20, 0],
  ];

  it("returns forward distance when available", () => {
    expect(getEdgeDistance(matrix, 0, 1)).toBe(10);
  });

  it("returns backward distance when forward is INF", () => {
    const asym: DistanceMatrix = [
      [0, INF, 30],
      [INF, 0, 20],
      [30, 20, 0],
    ];
    expect(getEdgeDistance(asym, 0, 2)).toBe(30);
  });

  it("returns INF when no path exists", () => {
    expect(getEdgeDistance(matrix, 0, 2)).toBe(INF);
  });

  it("returns INF for out-of-bounds indices", () => {
    expect(getEdgeDistance(matrix, 5, 1)).toBe(INF);
  });

  it("prefers the minimum of forward/backward", () => {
    const asym: DistanceMatrix = [
      [0, 5, INF],
      [3, 0, INF],
      [INF, INF, 0],
    ];
    expect(getEdgeDistance(asym, 0, 1)).toBe(3);
  });
});

describe("minOutgoingToSet", () => {
  const matrix: DistanceMatrix = [
    [0, 10, 30, INF],
    [10, 0, 20, 40],
    [30, 20, 0, 50],
    [INF, 40, 50, 0],
  ];

  it("finds minimum edge from node to set of targets", () => {
    expect(minOutgoingToSet(matrix, 0, [1, 2])).toBe(10);
  });

  it("returns INF when no edges exist to targets", () => {
    expect(minOutgoingToSet(matrix, 0, [3])).toBe(INF);
  });

  it("skips self-referencing", () => {
    expect(minOutgoingToSet(matrix, 0, [0, 1])).toBe(10);
  });

  it("returns INF for empty target set", () => {
    expect(minOutgoingToSet(matrix, 0, [])).toBe(INF);
  });
});

describe("computeLowerBound", () => {
  const matrix: DistanceMatrix = [
    [0, 10, 20, 30],
    [10, 0, 15, 25],
    [20, 15, 0, 35],
    [30, 25, 35, 0],
  ];

  it("returns a finite bound for a valid path", () => {
    const bound = computeLowerBound(matrix, [0], 3, 0, 4);
    expect(Number.isFinite(bound)).toBe(true);
    expect(bound).toBeGreaterThan(0);
  });

  it("includes current cost in the bound", () => {
    const bound = computeLowerBound(matrix, [0], 3, 10, 4);
    expect(bound).toBeGreaterThanOrEqual(10);
  });

  it("returns INF when a required edge is missing", () => {
    const disconnected: DistanceMatrix = [
      [0, INF, 20, INF],
      [INF, 0, INF, INF],
      [20, INF, 0, 30],
      [INF, INF, 30, 0],
    ];
    const bound = computeLowerBound(disconnected, [0], 3, 0, 4);
    expect(bound).toBe(INF);
  });

  it("handles path nearing completion (no unvisited intermediate)", () => {
    const bound = computeLowerBound(matrix, [0, 2], 3, 20, 4);
    expect(Number.isFinite(bound)).toBe(true);
    expect(bound).toBeGreaterThanOrEqual(20);
  });

  it("returns a bound that increases with more nodes visited", () => {
    const boundEarly = computeLowerBound(matrix, [0], 3, 0, 4);
    const boundLater = computeLowerBound(matrix, [0, 1], 3, 10, 4);
    expect(boundLater).toBeGreaterThanOrEqual(boundEarly);
  });
});

describe("makeTraceNode", () => {
  it("creates a proper BranchTraceNode from arguments", () => {
    const node = makeTraceNode({
      id: 1,
      parentId: null,
      path: [0, 2],
      labels: ["A", "B", "C"],
      cost: 20,
      bound: 25,
      status: "expanded",
      message: "test node",
    });
    expect(node.id).toBe(1);
    expect(node.parentId).toBeNull();
    expect(node.depth).toBe(1);
    expect(node.path).toEqual([0, 2]);
    expect(node.pathLabels).toEqual(["A", "C"]);
    expect(node.cost).toBe(20);
    expect(node.bound).toBe(25);
    expect(node.status).toBe("expanded");
    expect(node.message).toBe("test node");
  });

  it("handles empty path", () => {
    const node = makeTraceNode({
      id: 0,
      parentId: null,
      path: [],
      labels: ["A"],
      cost: 0,
      bound: 0,
      status: "expanded",
      message: "root",
    });
    expect(node.depth).toBe(0);
    expect(node.pathLabels).toEqual([]);
  });

  it("uses fallback label for missing index", () => {
    const node = makeTraceNode({
      id: 0,
      parentId: null,
      path: [5],
      labels: ["A"],
      cost: 0,
      bound: 0,
      status: "expanded",
      message: "test",
    });
    expect(node.pathLabels).toEqual(["Node 5"]);
  });
});
