import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NoItems from "../NoItems";

describe("NoItems Component", () => {
  it("should render empty items placeholder message", () => {
    render(<NoItems />);
    expect(screen.getByText("There are no items to show.")).toBeInTheDocument();
  });
});
