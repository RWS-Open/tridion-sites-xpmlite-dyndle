import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import FolderTreeviewActionButtons from "../FolderTreeviewActionButtons";
import { renderWithProviders } from "../../../testUtils";

describe("FolderTreeviewActionButtons Component", () => {
  it("should render Constraints popover button", () => {
    const preloadedState = {
      pageInfoReducer: {
        selectedKeys: {
          title: "Sample Node",
          key: "node_1",
          type: "EmbeddedRegion",
          constraints: {
            maxOccurance: 5,
            minOccurance: 1,
            numberItemsExist: 2,
            typeConstraint: [],
          },
        },
      },
    };

    renderWithProviders(
      <FolderTreeviewActionButtons updatePageData={vi.fn()} handleCancel={vi.fn()} />,
      { preloadedState }
    );
    expect(screen.getByText("Insert")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });
});
