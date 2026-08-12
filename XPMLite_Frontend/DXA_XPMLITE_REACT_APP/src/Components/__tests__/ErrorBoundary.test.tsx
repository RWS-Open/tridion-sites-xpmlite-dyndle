import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../ErrorBoundary";

const ProblemComponent = () => {
  throw new Error("Test component crash!");
};

describe("ErrorBoundary Component", () => {
  it("should render children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Normal Component Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal Component Content")).toBeInTheDocument();
  });

  it("should catch errors and render fallback error UI when a child crashes", () => {
    // Suppress console.error log for expected test failure
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test component crash!")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
