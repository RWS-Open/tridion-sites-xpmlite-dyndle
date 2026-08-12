import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import PageTreeview from "../PageTreeview";
import { renderWithProviders } from "../../../testUtils";

describe("PageTreeview Component", () => {
  it("should render error or empty alert when componentPresentation is empty", () => {
    const preloadedState = {
      pageReducer: { pageId: "tcm_5-10-64" },
      pageInfoReducer: {
        isLoading: false,
        componentPresentation: [],
        expandkeys: [],
        errorLoading: "No data available",
      },
    };

    renderWithProviders(<PageTreeview />, { preloadedState });
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("should render loading spinner when isLoading is true", () => {
    const preloadedState = {
      pageReducer: { pageId: "tcm_5-10-64" },
      pageInfoReducer: {
        isLoading: true,
        componentPresentation: [],
        expandkeys: [],
      },
    };

    const { container } = renderWithProviders(<PageTreeview />, { preloadedState });
    expect(container.querySelector(".ant-spin")).toBeInTheDocument();
  });
});
