import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import PageDrawer from "../PageDrawer";
import { renderWithProviders } from "../../../testUtils";

describe("PageDrawer Component", () => {
  it("should render drawer when showPageInfo is true and pageId is provided", () => {
    const preloadedState = {
      pageReducer: {
        showPageInfo: true,
        pageId: "tcm_5-10-64",
        showPageBuilder: false,
      },
    };

    renderWithProviders(<PageDrawer />, { preloadedState });
    expect(screen.getByText("Page")).toBeInTheDocument();
  });

  it("should not render drawer title when showPageInfo is false", () => {
    const preloadedState = {
      pageReducer: {
        showPageInfo: false,
        pageId: "tcm_5-10-64",
        showPageBuilder: false,
      },
    };

    renderWithProviders(<PageDrawer />, { preloadedState });
    expect(screen.queryByText("Page Structure")).not.toBeInTheDocument();
  });
});
