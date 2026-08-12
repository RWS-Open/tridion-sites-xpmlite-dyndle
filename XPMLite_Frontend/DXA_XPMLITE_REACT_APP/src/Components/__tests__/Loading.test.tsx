import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "../Loading";

describe("Loading Component", () => {
  it("should render loading spinner text", () => {
    render(<Loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should handle optional status property", () => {
    const { container } = render(<Loading status="fetching" />);
    expect(container.querySelector(".page-loader")).toBeInTheDocument();
  });
});
