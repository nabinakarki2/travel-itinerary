import BranchAndBoundTree from "@/app/route/components/BranchAndBoundTree";
import type { BranchAndBoundResult } from "@/lib/branch-and-bound";

interface BranchAndBoundSectionProps {
  bnbResult: BranchAndBoundResult | null;
  visibleStepCount: number;
  roadDistanceError: string;
}

export default function BranchAndBoundSection({
  bnbResult,
  visibleStepCount,
  roadDistanceError,
}: BranchAndBoundSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Branch and Bound (Live Tree)
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        The tree shows accepted and pruned branches while searching for the
        minimum-cost route from start to destination.
      </p>

      {roadDistanceError ? (
        <p className="mt-3 text-sm text-red-600">{roadDistanceError}</p>
      ) : null}

      {bnbResult && visibleStepCount >= (bnbResult.steps?.length ?? 0) ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Best Route
            </p>
            <p className="mt-2 text-sm font-semibold text-emerald-900">
              {bnbResult.bestPathLabels.length > 0
                ? bnbResult.bestPathLabels.join(" -> ")
                : "No feasible route found"}
            </p>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Total Distance
            </p>
            <p className="mt-2 text-sm font-semibold text-sky-900">
              {typeof bnbResult.bestCost === "number"
                ? `${(bnbResult.bestCost / 1000).toFixed(1)} km`
                : "n/a"}
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Search Stats
            </p>
            <p className="mt-2 text-sm font-semibold text-amber-900">
              Visited: {bnbResult.visitedNodes} | Pruned:{" "}
              {bnbResult.prunedNodes}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Choose start/destination and click Generate Route to run the
          algorithm.
        </p>
      )}

      <div className="mt-5">
        <BranchAndBoundTree
          steps={bnbResult?.steps ?? []}
          visibleCount={visibleStepCount}
        />
      </div>
    </div>
  );
}
