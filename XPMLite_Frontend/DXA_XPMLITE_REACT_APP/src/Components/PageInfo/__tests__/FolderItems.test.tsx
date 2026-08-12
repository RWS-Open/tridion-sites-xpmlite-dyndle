import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import FolderItems from "../FolderItems";
import { renderWithProviders } from "../../../testUtils";

describe("FolderItems Component", () => {
  it("should render table container for folder items", () => {
    const preloadedState = {
      pageInfoReducer: {
        selectedKeys: { key: "region_123" },
      },
    };

    renderWithProviders(
      <FolderItems selectedItemId="tcm_5-100-2" />,
      { preloadedState }
    );

    expect(screen.getByText("There are no items to show.")).toBeInTheDocument();
  });
});
