import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RouteOptionSelect from "@/app/route/components/RouteOptionSelect";
import type { RouteOption } from "@/app/route/components/types";

const options: RouteOption[] = [
  { label: "Airport", value: -1, icon: "airport", tag: "Recommended" },
  { label: "Phewa Lake", value: 1, tag: "Lake" },
  { label: "Shanti Stupa", value: 2, tag: "Monument" },
];

describe("RouteOptionSelect", () => {
  it("renders with placeholder when no value is selected", () => {
    render(
      <RouteOptionSelect
        label="From"
        placeholder="Select start"
        value={null}
        options={options}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText("Select start")).toBeInTheDocument();
  });

  it("renders the selected option label", () => {
    render(
      <RouteOptionSelect
        label="From"
        value={1}
        options={options}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText("Phewa Lake")).toBeInTheDocument();
  });

  it("opens dropdown on click", async () => {
    const user = userEvent.setup();
    render(
      <RouteOptionSelect
        label="From"
        value={null}
        options={options}
        onChange={jest.fn()}
      />,
    );
    const trigger = screen.getByRole("button");
    await user.click(trigger);
    expect(screen.getByText("Airport")).toBeInTheDocument();
    expect(screen.getByText("Shanti Stupa")).toBeInTheDocument();
  });

  it("calls onChange with the selected value", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <RouteOptionSelect
        label="From"
        value={null}
        options={options}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Airport"));
    expect(onChange).toHaveBeenCalledWith(-1);
  });

  it("calls onChange with null when clear is clicked", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <RouteOptionSelect
        label="From"
        value={1}
        options={options}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Clear selection"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("filters options by search input", async () => {
    const user = userEvent.setup();
    render(
      <RouteOptionSelect
        label="From"
        value={null}
        options={options}
        onChange={jest.fn()}
      />,
    );
    await user.click(screen.getByRole("button"));
    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "Lake");
    expect(screen.getByText("Phewa Lake")).toBeInTheDocument();
    expect(screen.queryByText("Shanti Stupa")).not.toBeInTheDocument();
  });

  it("shows 'No results' when filter matches nothing", async () => {
    const user = userEvent.setup();
    render(
      <RouteOptionSelect
        label="From"
        value={null}
        options={options}
        onChange={jest.fn()}
      />,
    );
    await user.click(screen.getByRole("button"));
    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "zzzzz");
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("closes dropdown after selection", async () => {
    const user = userEvent.setup();
    render(
      <RouteOptionSelect
        label="From"
        value={null}
        options={options}
        onChange={jest.fn()}
      />,
    );
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Airport"));
    expect(screen.queryByText("Shanti Stupa")).not.toBeInTheDocument();
  });

  it("shows a checkmark on the selected option", async () => {
    const user = userEvent.setup();
    render(
      <RouteOptionSelect
        label="From"
        value={1}
        options={options}
        onChange={jest.fn()}
      />,
    );
    await user.click(screen.getByRole("button"));
    expect(screen.getAllByText("Phewa Lake").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("✓")).toHaveLength(1);
  });
});
