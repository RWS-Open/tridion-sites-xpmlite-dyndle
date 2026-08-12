import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import PageType from "../PageType";
import { renderWithProviders } from "../../../testUtils";

describe("PageType Component", () => {
  it("should render page types grid", () => {
    const preloadedState = {
      pageBuilderReducer: {
        pageTypeList: [
          { title: "Home Page", itemId: "tcm_5-1-4", Image: "/path/img.png" },
          { title: "Article Page", itemId: "tcm_5-2-4", Image: "/path/article.png" },
        ],
        selectedPageType: { label: null, value: null },
      },
    };

    renderWithProviders(<PageType />, { preloadedState });
    expect(screen.getByText("Home Page")).toBeInTheDocument();
    expect(screen.getByText("Article Page")).toBeInTheDocument();
  });
});
