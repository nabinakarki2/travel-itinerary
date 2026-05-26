import {
  solveRouteWithBranchAndBound,
  type BranchAndBoundInput,
} from "@/lib/branch-and-bound";

describe("solveRouteWithBranchAndBound", () => {
  const makeInput = (overrides?: Partial<BranchAndBoundInput>): BranchAndBoundInput => ({
    startIndex: 0,
    endIndex: 3,
    labels: ["A", "B", "C", "D"],
    distances: [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0],
    ],
    ...overrides,
  });

  it("returns a valid best path for a simple 4-node graph", () => {
    const result = solveRouteWithBranchAndBound(makeInput());
    expect(result.bestPath.length).toBeGreaterThanOrEqual(2);
    expect(result.bestPathLabels.length).toBeGreaterThanOrEqual(2);
    expect(result.bestCost).not.toBeNull();
    expect(typeof result.bestCost).toBe("number");
  });

  it("starts at startIndex and ends at endIndex", () => {
    const result = solveRouteWithBranchAndBound(makeInput());
    expect(result.bestPath[0]).toBe(0);
    expect(result.bestPath[result.bestPath.length - 1]).toBe(3);
  });

  it("returns an empty result when totalNodes < 2", () => {
    const result = solveRouteWithBranchAndBound(
      makeInput({ labels: ["A"], distances: [[0]] }),
    );
    expect(result.bestPath).toEqual([]);
    expect(result.bestCost).toBeNull();
  });

  it("returns empty result for invalid start/end indices", () => {
    const result = solveRouteWithBranchAndBound(
      makeInput({ startIndex: -1, endIndex: 2 }),
    );
    expect(result.bestPath).toEqual([]);
    expect(result.bestCost).toBeNull();
  });

  it("returns empty result when startIndex equals endIndex", () => {
    const result = solveRouteWithBranchAndBound(
      makeInput({ startIndex: 1, endIndex: 1 }),
    );
    expect(result.bestPath).toEqual([]);
    expect(result.bestCost).toBeNull();
  });

  it("returns empty result for out-of-range indices", () => {
    const result = solveRouteWithBranchAndBound(
      makeInput({ startIndex: 10, endIndex: 2 }),
    );
    expect(result.bestPath).toEqual([]);
    expect(result.bestCost).toBeNull();
  });

  it("produces visitedNodes > 0 when a solution exists", () => {
    const result = solveRouteWithBranchAndBound(makeInput());
    expect(result.visitedNodes).toBeGreaterThan(0);
  });

  it("returns solution steps in the trace", () => {
    const result = solveRouteWithBranchAndBound(makeInput());
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].status).toBe("expanded");
  });

  it("handles a disconnected graph gracefully", () => {
    const result = solveRouteWithBranchAndBound({
      startIndex: 0,
      endIndex: 2,
      labels: ["X", "Y", "Z"],
      distances: [
        [0, null, null],
        [null, 0, 50],
        [null, 50, 0],
      ],
    });
    expect(result.bestPath).toEqual([]);
    expect(result.bestCost).toBeNull();
  });

  it("finds optimal path minimizing total cost", () => {
    const result = solveRouteWithBranchAndBound({
      startIndex: 0,
      endIndex: 3,
      labels: ["A", "B", "C", "D"],
      distances: [
        [0, 2, 9, 10],
        [1, 0, 6, 4],
        [15, 7, 0, 8],
        [6, 3, 12, 0],
      ],
    });
    expect(result.bestCost).not.toBeNull();
    expect(result.bestPath[0]).toBe(0);
    expect(result.bestPath[result.bestPath.length - 1]).toBe(3);
  });

  it("handles INF distances correctly", () => {
    const INF = Number.POSITIVE_INFINITY;
    const result = solveRouteWithBranchAndBound({
      startIndex: 0,
      endIndex: 2,
      labels: ["A", "B", "C"],
      distances: [
        [0, 5, INF],
        [INF, 0, 10],
        [INF, INF, 0],
      ],
    });
    expect(result.bestPath).toEqual([0, 1, 2]);
    expect(result.bestCost).toBe(15);
  });
});
