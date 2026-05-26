import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RouteSelectors from "@/app/route/components/RouteSelectors";
import type { RouteOption } from "@/app/route/components/types";

const placeOptions: RouteOption[] = [
  { label: "Phewa Lake", value: 1, tag: "Lake" },
  { label: "Shanti Stupa", value: 2, tag: "Monument" },
];

const allOptions: RouteOption[] = [
  {
    label: "Tribhuvan International Airport",
    value: -1,
    icon: "airport",
    tag: "Recommended for international tourists",
    coords: { lat: 27.6939, lon: 85.3582 },
  },
  {
    label: "Current Location",
    value: -2,
    icon: "location",
  },
  ...placeOptions,
];

describe("RouteSelectors", () => {
  it("renders nothing when placesLength is 0", () => {
    const { container } = render(
      <RouteSelectors
        placesLength={0}
        startId={null}
        endId={null}
        startOptions={[]}
        endOptions={[]}
        onStartChange={jest.fn()}
        onEndChange={jest.fn()}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders start and destination sections", () => {
    render(
      <RouteSelectors
        placesLength={3}
        startId={null}
        endId={null}
        startOptions={allOptions}
        endOptions={allOptions}
        onStartChange={jest.fn()}
        onEndChange={jest.fn()}
      />,
    );
    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("Destination")).toBeInTheDocument();
  });

  it("displays route summary when both start and end are selected", () => {
    render(
      <RouteSelectors
        placesLength={3}
        startId={-1}
        endId={1}
        startOptions={allOptions}
        endOptions={allOptions}
        startOption={allOptions[0]}
        endOption={placeOptions[0]}
        startCoords={{ lat: 27.6939, lon: 85.3582 }}
        endCoords={{ lat: 28.2096, lon: 83.9456 }}
        onStartChange={jest.fn()}
        onEndChange={jest.fn()}
      />,
    );
    expect(
      screen.getByText(/Route:/),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Phewa Lake/).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("calls onStartChange when start selector changes", async () => {
    const onStartChange = jest.fn();
    const user = userEvent.setup();
    render(
      <RouteSelectors
        placesLength={3}
        startId={null}
        endId={null}
        startOptions={allOptions}
        endOptions={allOptions}
        onStartChange={onStartChange}
        onEndChange={jest.fn()}
      />,
    );
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);
    await user.click(screen.getByText("Phewa Lake"));
    expect(onStartChange).toHaveBeenCalledWith(1);
  });

  it("calls onEndChange when destination is selected", async () => {
    const onEndChange = jest.fn();
    const user = userEvent.setup();
    render(
      <RouteSelectors
        placesLength={3}
        startId={1}
        endId={null}
        startOptions={allOptions}
        endOptions={allOptions}
        startOption={placeOptions[0]}
        onStartChange={jest.fn()}
        onEndChange={onEndChange}
      />,
    );
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]);
    await user.click(screen.getAllByText("Shanti Stupa").pop()!);
    expect(onEndChange).toHaveBeenCalledWith(2);
  });
});
