import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import FolderTreeview from "../FolderTreeview";
import { renderWithProviders } from "../../../testUtils";

describe("FolderTreeview Component", () => {
  it("should render Select Component modal when toggleModalTreeView is true", () => {
    const updatePageDataMock = vi.fn();
    const preloadedState = {
      pageInfoReducer: {
        toggleModalTreeView: true,
        selectedKeys: { key: "region_123" },
      },
    };

    renderWithProviders(<FolderTreeview updatePageData={updatePageDataMock} />, { preloadedState });
    expect(screen.getByText("Select an item")).toBeInTheDocument();
  });
});
