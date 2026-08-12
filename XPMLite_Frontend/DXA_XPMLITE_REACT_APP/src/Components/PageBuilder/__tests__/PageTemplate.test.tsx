import { describe, it, expect } from "vitest";

import PageTemplate from "../PageTemplate";
import { renderWithProviders } from "../../../testUtils";

describe("PageTemplate Component", () => {
  it("should render tree container for structure groups and templates", () => {
    const preloadedState = {
      pageBuilderReducer: {
        structureGroupIds: { home: "tcm_5-10-4", pageTypes: "tcm_5-20-4" },
      },
    };

    const sampleTemplate = [{ Title: "Sample Page", $type: "Page", Id: "tcm_5-10-64" }];
    const { container } = renderWithProviders(
      <PageTemplate pageTemplate={sampleTemplate} />,
      { preloadedState }
    );

    expect(container.querySelector(".ant-tree")).toBeInTheDocument();
  });
});
