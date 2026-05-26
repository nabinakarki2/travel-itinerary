import { renderHook, act } from "@testing-library/react";
import {
  SelectedPlacesProvider,
  useSelectedPlaces,
} from "@/app/context/SelectedPlacesContext";
import type { PlaceResult } from "@/actions/search";
import { type ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <SelectedPlacesProvider>{children}</SelectedPlacesProvider>;
}

const makePlace = (id: number, name: string): PlaceResult => ({
  place_id: id,
  name,
  description: `Description of ${name}`,
  district: "Test District",
  state: "Test State",
  type: "Test Type",
  latitude: 27.0,
  longitude: 85.0,
});

describe("SelectedPlacesContext", () => {
  it("starts with an empty list", () => {
    const { result } = renderHook(() => useSelectedPlaces(), { wrapper });
    expect(result.current.selectedPlaces).toEqual([]);
  });

  it("adds a place", () => {
    const { result } = renderHook(() => useSelectedPlaces(), { wrapper });
    act(() => result.current.addPlace(makePlace(1, "Phewa Lake")));
    expect(result.current.selectedPlaces).toHaveLength(1);
    expect(result.current.selectedPlaces[0].name).toBe("Phewa Lake");
  });

  it("does not add duplicate places", () => {
    const { result } = renderHook(() => useSelectedPlaces(), { wrapper });
    const place = makePlace(1, "Phewa Lake");
    act(() => result.current.addPlace(place));
    act(() => result.current.addPlace(place));
    expect(result.current.selectedPlaces).toHaveLength(1);
  });

  it("removes a place by place_id", () => {
    const { result } = renderHook(() => useSelectedPlaces(), { wrapper });
    act(() => result.current.addPlace(makePlace(1, "Phewa Lake")));
    act(() => result.current.addPlace(makePlace(2, "Shanti Stupa")));
    expect(result.current.selectedPlaces).toHaveLength(2);
    act(() => result.current.removePlace(1));
    expect(result.current.selectedPlaces).toHaveLength(1);
    expect(result.current.selectedPlaces[0].name).toBe("Shanti Stupa");
  });

  it("clears all places", () => {
    const { result } = renderHook(() => useSelectedPlaces(), { wrapper });
    act(() => result.current.addPlace(makePlace(1, "Phewa Lake")));
    act(() => result.current.addPlace(makePlace(2, "Shanti Stupa")));
    act(() => result.current.clearPlaces());
    expect(result.current.selectedPlaces).toEqual([]);
  });

  it("handles removing a non-existent place gracefully", () => {
    const { result } = renderHook(() => useSelectedPlaces(), { wrapper });
    act(() => result.current.addPlace(makePlace(1, "Phewa Lake")));
    act(() => result.current.removePlace(999));
    expect(result.current.selectedPlaces).toHaveLength(1);
  });

  it("throws error when used outside provider", () => {
    expect(() => renderHook(() => useSelectedPlaces())).toThrow(
      "useSelectedPlaces must be used within a SelectedPlacesProvider",
    );
  });

  it("maintains insertion order", () => {
    const { result } = renderHook(() => useSelectedPlaces(), { wrapper });
    act(() => result.current.addPlace(makePlace(2, "B")));
    act(() => result.current.addPlace(makePlace(1, "A")));
    act(() => result.current.addPlace(makePlace(3, "C")));
    expect(result.current.selectedPlaces[0].name).toBe("B");
    expect(result.current.selectedPlaces[1].name).toBe("A");
    expect(result.current.selectedPlaces[2].name).toBe("C");
  });

  it("allows re-adding after removal", () => {
    const { result } = renderHook(() => useSelectedPlaces(), { wrapper });
    const place = makePlace(1, "Phewa Lake");
    act(() => result.current.addPlace(place));
    act(() => result.current.removePlace(1));
    expect(result.current.selectedPlaces).toHaveLength(0);
    act(() => result.current.addPlace(place));
    expect(result.current.selectedPlaces).toHaveLength(1);
  });
});
