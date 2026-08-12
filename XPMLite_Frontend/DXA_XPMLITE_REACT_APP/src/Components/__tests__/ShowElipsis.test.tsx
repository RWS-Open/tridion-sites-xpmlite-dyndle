import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShowElipsis } from "../ShowElipsis";

describe("ShowElipsis Component", () => {
  it("should render title text cleanly inside typography text component", () => {
    render(<ShowElipsis title="Sample Component Title" />);
    const textElement = screen.getByText("Sample Component Title");
    expect(textElement).toBeInTheDocument();
  });

  it("should handle empty string title without crashing", () => {
    const { container } = render(<ShowElipsis title="" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
